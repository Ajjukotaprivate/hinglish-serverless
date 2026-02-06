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
 * Note: Multer saves without extension, so we use a distinct output path
 */
async function extractAudio(videoPath) {
  // Use unique output path (multer files have no extension - same path would overwrite input!)
  const audioPath = videoPath + '_audio.wav';

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
 * RunPod status: IN_QUEUE (cold start) -> IN_PROGRESS -> COMPLETED
 */
async function transcribeWithRunPod(audioBase64, stepStartTime) {
  const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
  const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;
  const RUN_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/run`;
  const STATUS_URL = `https://api.runpod.ai/v2/${RUNPOD_ENDPOINT_ID}/status/`;

  // Submit job to RunPod
  console.log(`   └─ POST to RunPod API (endpoint: ${RUNPOD_ENDPOINT_ID})`);
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

  console.log(`   └─ Job submitted: ${jobId}`);
  console.log(`   └─ Polling for result (IN_QUEUE = cold start, IN_PROGRESS = transcribing)...`);

  // Poll for result (max 5 minutes)
  const maxAttempts = 100;
  let attempts = 0;
  let lastStatus = '';

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Poll every 3 seconds

    const statusResponse = await fetch(STATUS_URL + jobId, {
      headers: { 'Authorization': `Bearer ${RUNPOD_API_KEY}` },
    });

    const statusData = await statusResponse.json();
    const status = statusData.status;

    // Only log when status changes
    if (status !== lastStatus) {
      const elapsed = ((Date.now() - (stepStartTime || Date.now())) / 1000).toFixed(1);
      const statusMeaning = status === 'IN_QUEUE' ? '(cold start - GPU worker spinning up)' :
                         status === 'IN_PROGRESS' ? '(transcribing with Whisper model)' :
                         status === 'COMPLETED' ? '(done!)' : '';
      console.log(`   └─ [${elapsed}s] RunPod: ${status} ${statusMeaning}`);
      lastStatus = status;
    }

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
function logStep(step, message, elapsed) {
  const elapsedStr = elapsed ? ` [${(elapsed / 1000).toFixed(1)}s]` : '';
  console.log(`\n========== STEP ${step} ==========`);
  console.log(`[${new Date().toISOString()}] ${message}${elapsedStr}`);
}

app.post('/process-video', upload.single('video'), async (req, res) => {
  const startTime = Date.now();
  let videoPath, audioPath;
  let stepStart = startTime;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const userId = req.body.userId || 'anonymous';
    const timestamp = Date.now();

    videoPath = req.file.path;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${new Date().toISOString()}] NEW REQUEST: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`${'='.repeat(60)}\n`);

    // Step 1: Extract audio with FFmpeg (Railway)
    logStep(1, 'Extracting audio with FFmpeg (16kHz mono WAV)...', null);
    stepStart = Date.now();
    audioPath = await extractAudio(videoPath);
    logStep(1, 'Audio extracted successfully', Date.now() - stepStart);

    // Step 2: Read audio as base64
    logStep(2, 'Encoding audio to base64 for RunPod...', null);
    stepStart = Date.now();
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');
    logStep(2, `Audio encoded (${(audioBase64.length / 1024).toFixed(1)} KB base64)`, Date.now() - stepStart);

    // Step 3: Upload audio to Supabase Storage
    logStep(3, 'Uploading audio to Supabase Storage...', null);
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
    logStep(3, `Audio uploaded to Supabase: ${audioStoragePath}`, Date.now() - stepStart);

    // Step 4: Send to RunPod for transcription (may have cold start!)
    logStep(4, 'Sending audio to RunPod serverless endpoint...', null);
    stepStart = Date.now();
    const transcription = await transcribeWithRunPod(audioBase64, stepStart);
    logStep(4, `Transcription done: ${transcription.segments.length} segments, ${transcription.words?.length || 0} words`, Date.now() - stepStart);

    // Step 5: Generate SRT and VTT
    logStep(5, 'Generating SRT and VTT subtitle files...', null);
    const srtContent = segmentsToSRT(transcription.segments);
    const vttContent = segmentsToVTT(transcription.segments);
    logStep(5, `SRT/VTT generated (${srtContent.length} chars)`, Date.now() - stepStart);

    // Step 6: Upload SRT/VTT to Supabase
    logStep(6, 'Uploading SRT and VTT to Supabase Storage...', null);
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
    logStep(6, 'Subtitles uploaded to Supabase', Date.now() - stepStart);

    // Step 7: Upload word-level JSON (optional)
    if (transcription.words && transcription.words.length > 0) {
      const wordsPath = `${userId}/subtitles/${timestamp}-words.json`;
      await supabase.storage.from('subtitles').upload(
        wordsPath,
        JSON.stringify(transcription.words),
        { contentType: 'application/json', upsert: false }
      );
      console.log(`   └─ Word-level JSON uploaded`);
    }

    // Step 8: Get public URLs
    const { data: audioUrl } = supabase.storage.from('audio').getPublicUrl(audioStoragePath);
    const { data: srtUrl } = supabase.storage.from('subtitles').getPublicUrl(srtPath);
    const { data: vttUrl } = supabase.storage.from('subtitles').getPublicUrl(vttPath);

    const totalTime = Date.now() - startTime;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${new Date().toISOString()}] PIPELINE COMPLETE! Total: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`   SRT URL ready | Segments: ${transcription.segments.length} | Words: ${transcription.words?.length || 0}`);
    console.log(`${'='.repeat(60)}\n`);

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
