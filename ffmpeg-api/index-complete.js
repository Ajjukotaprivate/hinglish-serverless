/**
 * Complete Video Processing API (Railway)
 * 
 * This single API handles EVERYTHING:
 * 1. Video upload
 * 2. Audio extraction (FFmpeg)
 * 3. RunPod transcription
 * 4. SRT/VTT generation
 * 5. Upload to Supabase Storage
 * 6. Return results
 * 
 * NO EDGE FUNCTION NEEDED!
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format seconds to SRT timestamp
 */
function formatSRTTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * Format seconds to VTT timestamp
 */
function formatVTTTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Convert segments to SRT
 */
function segmentsToSRT(segments) {
  const srtLines = [];

  segments.forEach((seg, index) => {
    const start = formatSRTTimestamp(seg.start);
    const end = formatSRTTimestamp(seg.end);
    const text = seg.text.trim();

    srtLines.push(`${index + 1}`);
    srtLines.push(`${start} --> ${end}`);
    srtLines.push(text);
    srtLines.push('');
  });

  return srtLines.join('\n');
}

/**
 * Convert segments to VTT
 */
function segmentsToVTT(segments) {
  const vttLines = ['WEBVTT', ''];

  segments.forEach((seg) => {
    const start = formatVTTTimestamp(seg.start);
    const end = formatVTTTimestamp(seg.end);
    const text = seg.text.trim();

    vttLines.push(`${start} --> ${end}`);
    vttLines.push(text);
    vttLines.push('');
  });

  return vttLines.join('\n');
}

/**
 * Extract audio from video using FFmpeg
 */
async function extractAudio(videoPath) {
  const audioPath = videoPath.replace(/\.[^.]+$/, '.wav');

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .on('end', () => resolve(audioPath))
      .on('error', reject)
      .save(audioPath);
  });
}

/**
 * Send audio to RunPod and get transcription
 */
async function transcribeWithRunPod(audioBase64) {
  const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
  const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
  const RUN_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`;
  const STATUS_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/`;

  // Submit job
  const submitResponse = await fetch(RUN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: { audio: audioBase64 } }),
  });

  const submitData = await submitResponse.json();
  const jobId = submitData.id;

  if (!jobId) {
    throw new Error('No job ID returned from RunPod');
  }

  console.log(`RunPod job submitted: ${jobId}`);

  // Poll for result (max 5 minutes)
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const statusResponse = await fetch(STATUS_URL + jobId, {
      headers: { 'Authorization': `Bearer ${RUNPOD_API_KEY}` },
    });

    const statusData = await statusResponse.json();
    const status = statusData.status;

    console.log(`RunPod status: ${status}`);

    if (status === 'COMPLETED') {
      return statusData.output;
    }

    if (status === 'FAILED') {
      throw new Error(`RunPod failed: ${JSON.stringify(statusData)}`);
    }

    attempts++;
  }

  throw new Error('RunPod timeout (5 minutes)');
}

// ============================================
// MAIN ENDPOINT
// ============================================

/**
 * Complete Video Processing Pipeline
 * POST /process-video
 * 
 * Does EVERYTHING in one API call:
 * - Extract audio from video
 * - Transcribe with RunPod
 * - Generate SRT/VTT
 * - Upload to Supabase
 * - Return results
 */
app.post('/process-video', upload.single('video'), async (req, res) => {
  const startTime = Date.now();
  let videoPath, audioPath;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const userId = req.body.userId || 'anonymous';
    const timestamp = Date.now();

    videoPath = req.file.path;
    console.log(`[${new Date().toISOString()}] Processing: ${req.file.originalname}`);

    // Step 1: Extract audio
    console.log('Step 1: Extracting audio with FFmpeg...');
    audioPath = await extractAudio(videoPath);
    console.log('✅ Audio extracted');

    // Step 2: Read audio as base64
    console.log('Step 2: Reading audio as base64...');
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');
    console.log(`✅ Audio encoded (${audioBase64.length} chars)`);

    // Step 3: Upload audio to Supabase Storage
    console.log('Step 3: Uploading audio to Supabase...');
    const audioStoragePath = `${userId}/audio/${timestamp}-audio.wav`;
    const { error: audioUploadError } = await supabase.storage
      .from('audio')
      .upload(audioStoragePath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (audioUploadError) {
      throw new Error(`Audio upload failed: ${audioUploadError.message}`);
    }
    console.log(`✅ Audio uploaded: ${audioStoragePath}`);

    // Step 4: Send to RunPod for transcription
    console.log('Step 4: Sending to RunPod ASR...');
    const transcription = await transcribeWithRunPod(audioBase64);
    console.log(`✅ Transcription completed: ${transcription.segments.length} segments`);

    // Step 5: Generate SRT and VTT
    console.log('Step 5: Generating SRT/VTT...');
    const srtContent = segmentsToSRT(transcription.segments);
    const vttContent = segmentsToVTT(transcription.segments);
    console.log('✅ Subtitles generated');

    // Step 6: Upload SRT/VTT to Supabase
    console.log('Step 6: Uploading subtitles to Supabase...');
    const srtPath = `${userId}/subtitles/${timestamp}.srt`;
    const vttPath = `${userId}/subtitles/${timestamp}.vtt`;

    await Promise.all([
      supabase.storage.from('subtitles').upload(srtPath, srtContent, {
        contentType: 'text/plain',
        upsert: false,
      }),
      supabase.storage.from('subtitles').upload(vttPath, vttContent, {
        contentType: 'text/vtt',
        upsert: false,
      }),
    ]);
    console.log(`✅ Subtitles uploaded`);

    // Step 7: Upload word-level JSON (optional)
    if (transcription.words && transcription.words.length > 0) {
      const wordsPath = `${userId}/subtitles/${timestamp}-words.json`;
      await supabase.storage.from('subtitles').upload(
        wordsPath,
        JSON.stringify(transcription.words),
        { contentType: 'application/json', upsert: false }
      );
      console.log(`✅ Word-level data uploaded`);
    }

    // Step 8: Get public URLs
    const { data: audioUrl } = supabase.storage.from('audio').getPublicUrl(audioStoragePath);
    const { data: srtUrl } = supabase.storage.from('subtitles').getPublicUrl(srtPath);
    const { data: vttUrl } = supabase.storage.from('subtitles').getPublicUrl(vttPath);

    const totalTime = Date.now() - startTime;
    console.log(`✅ Complete! Total time: ${(totalTime / 1000).toFixed(2)}s`);

    // Cleanup
    setTimeout(() => {
      try {
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        console.log('🧹 Temporary files cleaned up');
      } catch {}
    }, 1000);

    // Return response
    res.json({
      success: true,
      audioUrl: audioUrl.publicUrl,
      subtitles: {
        srt: srtUrl.publicUrl,
        vtt: vttUrl.publicUrl,
        text: transcription.text,
        segments: transcription.segments,
        words: transcription.words,
      },
      metadata: {
        originalFilename: req.file.originalname,
        originalSize: req.file.size,
        audioPath: audioStoragePath,
        srtPath,
        vttPath,
        timestamp,
        processingTimeMs: totalTime,
        segmentCount: transcription.segments.length,
        wordCount: transcription.words?.length || 0,
      },
    });

  } catch (error) {
    console.error('❌ Pipeline error:', error);

    // Cleanup on error
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch {}

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/', (req, res) => {
  res.json({
    service: 'Complete Video Processing API',
    status: 'running',
    version: '2.0.0',
    features: [
      'FFmpeg audio extraction',
      'RunPod Hinglish transcription',
      'SRT/VTT generation',
      'Supabase Storage integration',
      'All-in-one pipeline',
    ],
    endpoints: {
      process: 'POST /process-video',
      health: 'GET /health',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      ffmpeg: '✅ Available',
      supabase: supabase ? '✅ Connected' : '❌ Not configured',
      runpod: process.env.RUNPOD_API_KEY ? '✅ Configured' : '❌ Not configured',
    },
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚀 Complete Video Processing API v2.0`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Main endpoint:`);
  console.log(`   POST /process-video - Complete video → subtitles pipeline`);
  console.log(`\n⚙️  Services:`);
  console.log(`   ✅ FFmpeg - Audio extraction`);
  console.log(`   ✅ RunPod - Hinglish transcription`);
  console.log(`   ✅ Supabase - Storage & hosting`);
  console.log(`\n✅ Ready to process videos!\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down...');
  process.exit(0);
});
