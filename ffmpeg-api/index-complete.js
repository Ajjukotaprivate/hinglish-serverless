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
const https = require('https');
const http = require('http');
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
  limits: { fileSize: 350 * 1024 * 1024 }, // 350MB
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
 * Format seconds to ASS timestamp (H:MM:SS.cc)
 */
function formatASSTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const centis = Math.floor((seconds % 1) * 100);

  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
}

/**
 * Convert #RRGGBB or #RRGGBBAA to ASS colour &HAABBGGRR
 */
function hexToASSColor(hex, defaultAlpha = '00') {
  const m = hex.match(/^#?([a-fA-F0-9]{6})([a-fA-F0-9]{2})?$/);
  if (!m) return '&H00FFFFFF';
  const r = m[1].slice(4, 6);
  const g = m[1].slice(2, 4);
  const b = m[1].slice(0, 2);
  const a = (m[2] || defaultAlpha).toUpperCase();
  return `&H${a}${b}${g}${r}`;
}

/**
 * Convert segments + style to ASS (Advanced SubStation Alpha) for TikTok-style burn
 * ASS supports: fonts, outline, shadow, colors, alignment - all server-side via FFmpeg/libass
 */
function segmentsToASS(segments, style, playResX = 1080, playResY = 1920) {
  const fontName = (style?.fontFamily || 'Impact').replace(/\s+/g, ' ');
  const fontSize = style?.fontSize || 72;
  const textColor = hexToASSColor(style?.textColor || '#FFFFFF', '00');
  const outlineColor = hexToASSColor(style?.outlineColor || '#000000', '00');
  const outlineWidth = style?.outlineEnabled !== false ? (style?.outlineWidth || 4) : 0;
  const shadow = outlineWidth > 0 ? 2 : 0;
  const alignMap = { left: 7, center: 2, right: 9 };
  const alignment = alignMap[style?.alignment] || 2;
  const marginV = Math.floor(playResY * 0.15);

  const lines = [
    '[Script Info]',
    'Title: Hinglish Export',
    'ScriptType: v4.00+',
    `PlayResX: ${playResX}`,
    `PlayResY: ${playResY}`,
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Default,${fontName},${fontSize},${textColor},&H000000FF,${outlineColor},&H80000000,-1,0,0,0,100,100,0,0,1,${outlineWidth},${shadow},${alignment},40,40,${marginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];

  segments.forEach((seg) => {
    const start = formatASSTimestamp(seg.start);
    const end = formatASSTimestamp(seg.end);
    const text = (style?.allCaps ? seg.text.toUpperCase() : seg.text.trim())
      .replace(/\n/g, '\\N')
      .replace(/\r/g, '');
    lines.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
  });

  return lines.join('\r\n');
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

  // Submit job to RunPod (no language field - worker uses its default, e.g. Hinglish)
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

/**
 * Parse Supabase storage URL to extract bucket and path
 * Returns null if URL is not a Supabase storage URL
 */
function parseSupabaseStorageUrl(url) {
  // Match: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  // Or:    https://<project>.supabase.co/storage/v1/object/<bucket>/<path>
  const match = url.match(/supabase\.co\/storage\/v1\/object\/(?:public\/)?([^/]+)\/(.+)$/);
  if (match) {
    return { bucket: match[1], path: match[2] };
  }
  return null;
}

/**
 * Download file using Supabase SDK (for private buckets) or HTTP (for external URLs)
 * Service role key bypasses RLS for server-side operations
 */
async function downloadFile(url) {
  const tempPath = path.join('uploads', `burn-${Date.now()}-video.mp4`);
  console.log('   └─ Downloading video from:', url);

  // Try Supabase SDK first for Supabase storage URLs
  const storageInfo = parseSupabaseStorageUrl(url);
  if (storageInfo) {
    console.log(`   └─ Detected Supabase storage: bucket="${storageInfo.bucket}", path="${storageInfo.path}"`);
    try {
      const { data, error } = await supabase.storage
        .from(storageInfo.bucket)
        .download(storageInfo.path);

      if (error) {
        throw new Error(`Supabase download failed: ${error.message}`);
      }

      // Convert Blob to Buffer and write to file
      const buffer = Buffer.from(await data.arrayBuffer());
      console.log('   └─ Downloaded via Supabase SDK:', buffer.length, 'bytes');

      if (buffer.length < 1000) {
        throw new Error(`Downloaded file is too small (${buffer.length} bytes), likely corrupted or empty`);
      }

      fs.writeFileSync(tempPath, buffer);
      return tempPath;
    } catch (err) {
      console.log('   └─ Supabase SDK download failed, trying HTTP fallback:', err.message);
      // Fall through to HTTP download
    }
  }

  // HTTP fallback for external URLs or if Supabase SDK fails
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(tempPath);

    const request = protocol.get(url, (response) => {
      console.log('   └─ Response status:', response.statusCode);
      console.log('   └─ Content-Type:', response.headers['content-type']);
      console.log('   └─ Content-Length:', response.headers['content-length']);

      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        console.log('   └─ Following redirect to:', response.headers.location);
        file.close();
        fs.unlink(tempPath, () => { });
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }

      // Check for errors
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(tempPath, () => { });
        return reject(new Error(`Download failed with status ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          // Verify file has content
          try {
            const stats = fs.statSync(tempPath);
            console.log('   └─ Downloaded file size:', stats.size, 'bytes');
            if (stats.size < 1000) {
              fs.unlink(tempPath, () => { });
              return reject(new Error(`Downloaded file is too small (${stats.size} bytes), likely corrupted or empty`));
            }
            resolve(tempPath);
          } catch (err) {
            reject(new Error(`Failed to verify downloaded file: ${err.message}`));
          }
        });
      });

      file.on('error', (err) => {
        file.close();
        fs.unlink(tempPath, () => { });
        reject(new Error(`File write error: ${err.message}`));
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(tempPath, () => { });
      reject(new Error(`Request error: ${err.message}`));
    });

    // Add timeout
    request.setTimeout(60000, () => {
      request.destroy();
      file.close();
      fs.unlink(tempPath, () => { });
      reject(new Error('Download timeout after 60 seconds'));
    });
  });
}

// ============================================
// BURN SUBTITLES ENDPOINT
// ============================================

app.post('/burn-subtitles', express.json(), async (req, res) => {
  const startTime = Date.now();
  let videoPath, subPath, outputPath;

  try {
    const {
      videoUrl,
      segments,
      srtUrl,
      style,
      format = 'ass',
      quality = 'balanced',
      userId = 'anonymous',
      aspectRatio = '9:16',
    } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    const useASS = format === 'ass' || (style && Object.keys(style).length > 0);
    const playRes = aspectRatio === '9:16' ? { x: 1080, y: 1920 } : aspectRatio === '16:9' ? { x: 1920, y: 1080 } : { x: 1080, y: 1080 };

    let subContent;
    if (segments && Array.isArray(segments)) {
      const segs = segments.map((s) => ({ start: s.start, end: s.end, text: s.text }));
      if (useASS) {
        subContent = segmentsToASS(segs, style || {}, playRes.x, playRes.y);
      } else {
        subContent = segmentsToSRT(segs);
      }
    } else if (srtUrl && !useASS) {
      const srtRes = await fetch(srtUrl);
      subContent = await srtRes.text();
    } else {
      return res.status(400).json({ error: 'segments or srtUrl is required' });
    }

    const bitrateMap = { fast: '2M', balanced: '4M', high: '8M' };
    const bitrate = bitrateMap[quality] || '4M';

    logStep(1, 'Downloading video from Supabase...', null);
    videoPath = await downloadFile(videoUrl);

    const ext = useASS ? 'ass' : 'srt';
    logStep(2, `Writing ${ext.toUpperCase()} file (${useASS ? 'ASS - fonts, outline, TikTok-style' : 'SRT'})...`, null);
    subPath = path.join('uploads', `burn-${Date.now()}.${ext}`);
    fs.writeFileSync(subPath, subContent, 'utf8');

    outputPath = path.join('uploads', `burn-${Date.now()}-output.mp4`);

    logStep(3, 'Burning subtitles with FFmpeg (server-side)...', null);
    const subPathResolved = path.resolve(subPath).replace(/\\/g, '/');
    const subPathEscaped = subPathResolved.replace(/:/g, '\\:').replace(/'/g, "'\\''");
    const fontsDir = path.join(__dirname, 'fonts');
    const fontsDirResolved = fs.existsSync(fontsDir) ? path.resolve(fontsDir).replace(/\\/g, '/') : null;
    const vfFilter = fontsDirResolved
      ? `subtitles='${subPathEscaped}':fontsdir='${fontsDirResolved.replace(/'/g, "'\\''")}'`
      : `subtitles='${subPathEscaped}'`;

    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          '-vf', vfFilter,
          '-b:v', bitrate,
          '-c:a', 'copy',
        ])
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    logStep(4, 'Uploading to Supabase exports...', null);
    const exportsPath = `${userId}/exports/${Date.now()}-burned.mp4`;
    const outputBuffer = fs.readFileSync(outputPath);
    const { error: exportError } = await supabase.storage
      .from('exports')
      .upload(exportsPath, outputBuffer, {
        contentType: 'video/mp4',
        upsert: false,
      });

    if (exportError) {
      throw new Error(`Export upload failed: ${exportError.message}`);
    }

    // Generate signed URL (24 hours for downloads)
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('exports')
      .createSignedUrl(exportsPath, 86400); // 24 hours

    if (signedError) {
      throw new Error(`Failed to create download URL: ${signedError.message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`   └─ Burn complete in ${(totalTime / 1000).toFixed(1)}s`);

    setTimeout(() => {
      try {
        if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (subPath && fs.existsSync(subPath)) fs.unlinkSync(subPath);
        if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch { }
    }, 2000);

    res.json({
      success: true,
      downloadUrl: signedUrlData.signedUrl,
      storagePath: exportsPath,
      processingTimeMs: totalTime,
      expiresIn: 86400, // 24 hours
    });
  } catch (error) {
    console.error('❌ Burn error:', error);
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (subPath && fs.existsSync(subPath)) fs.unlinkSync(subPath);
      if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch { }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// MAIN ENDPOINT
// ============================================

/**
 * Log helper for pipeline steps
 */
function logStep(step, message, elapsed) {
  const elapsedStr = elapsed ? ` [${(elapsed / 1000).toFixed(1)}s]` : '';
  console.log(`\n========== STEP ${step} ==========`);
  console.log(`[${new Date().toISOString()}] ${message}${elapsedStr}`);
}

// ============================================
// UPLOAD VIDEO ONLY (no transcription)
// ============================================

app.post('/upload-video', upload.single('video'), async (req, res) => {
  let videoPath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }
    const userId = req.body.userId || 'anonymous';
    videoPath = req.file.path;
    const videoStoragePath = `${userId}/videos/${Date.now()}-${req.file.originalname || 'video.mp4'}`;
    const videoBuffer = fs.readFileSync(videoPath);
    const { error: videoUploadError } = await supabase.storage
      .from('videos')
      .upload(videoStoragePath, videoBuffer, {
        contentType: req.file.mimetype || 'video/mp4',
        upsert: false,
      });
    if (videoUploadError) {
      throw new Error(`Video upload failed: ${videoUploadError.message}`);
    }
    const SIGNED_URL_EXPIRY = 3600;
    const { data: signed } = await supabase.storage.from('videos').createSignedUrl(videoStoragePath, SIGNED_URL_EXPIRY);
    const videoUrl = signed?.signedUrl || null;
    setTimeout(() => {
      try { if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath); } catch { }
    }, 500);
    res.json({ success: true, videoUrl, storagePath: videoStoragePath });
  } catch (error) {
    if (videoPath && fs.existsSync(videoPath)) {
      try { fs.unlinkSync(videoPath); } catch { }
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TRANSCRIBE FROM VIDEO URL (no upload)
// ============================================

app.post('/transcribe', express.json(), async (req, res) => {
  let videoPath, audioPath;
  try {
    const { videoUrl, userId } = req.body || {};
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }
    const uid = userId || 'anonymous';
    const stepStart = Date.now();

    logStep(1, 'Downloading video...', null);
    videoPath = await downloadFile(videoUrl);
    logStep(1, 'Video downloaded', Date.now() - stepStart);

    logStep(2, 'Extracting audio...', null);
    const t2 = Date.now();
    audioPath = await extractAudio(videoPath);
    logStep(2, 'Audio extracted', Date.now() - t2);

    logStep(3, 'Encoding audio for RunPod...', null);
    const audioBuffer = fs.readFileSync(audioPath);
    const audioBase64 = audioBuffer.toString('base64');

    const audioStoragePath = `${uid}/audio/${Date.now()}-audio.wav`;
    await supabase.storage.from('audio').upload(audioStoragePath, audioBuffer, {
      contentType: 'audio/wav',
      upsert: false,
    });

    logStep(4, 'Sending to RunPod...', null);
    const t4 = Date.now();
    const transcription = await transcribeWithRunPod(audioBase64, t4);
    logStep(4, `Transcription done: ${transcription.segments.length} segments`, Date.now() - t4);

    const srtContent = segmentsToSRT(transcription.segments);
    const vttContent = segmentsToVTT(transcription.segments);
    const timestamp = Date.now();
    const srtPath = `${uid}/subtitles/${timestamp}.srt`;
    const vttPath = `${uid}/subtitles/${timestamp}.vtt`;
    await Promise.all([
      supabase.storage.from('subtitles').upload(srtPath, srtContent, { contentType: 'text/plain', upsert: false }),
      supabase.storage.from('subtitles').upload(vttPath, vttContent, { contentType: 'text/vtt', upsert: false }),
    ]);

    const SIGNED_URL_EXPIRY = 3600;
    const [srtSigned, vttSigned, audioSigned] = await Promise.all([
      supabase.storage.from('subtitles').createSignedUrl(srtPath, SIGNED_URL_EXPIRY),
      supabase.storage.from('subtitles').createSignedUrl(vttPath, SIGNED_URL_EXPIRY),
      supabase.storage.from('audio').createSignedUrl(audioStoragePath, SIGNED_URL_EXPIRY),
    ]);

    setTimeout(() => {
      try {
        if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      } catch { }
    }, 1000);

    res.json({
      success: true,
      segments: transcription.segments,
      subtitles: {
        srt: srtSigned?.data?.signedUrl,
        vtt: vttSigned?.data?.signedUrl,
        text: transcription.text,
        segments: transcription.segments,
        words: transcription.words,
      },
      audioUrl: audioSigned?.data?.signedUrl,
      storagePaths: { srt: srtPath, vtt: vttPath, audio: audioStoragePath },
    });
  } catch (error) {
    console.error('Transcribe error:', error);
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch { }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// COMPLETE VIDEO PROCESSING PIPELINE
// POST /process-video
// ============================================

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

    // Step 3b: Upload video to Supabase Storage (for preview and burn)
    const videoStoragePath = `${userId}/videos/${timestamp}-${req.file.originalname || 'video.mp4'}`;
    const videoBuffer = fs.readFileSync(videoPath);
    const { error: videoUploadError } = await supabase.storage
      .from('videos')
      .upload(videoStoragePath, videoBuffer, {
        contentType: req.file.mimetype || 'video/mp4',
        upsert: false,
      });

    let videoUrl = null;
    if (!videoUploadError) {
      const { data: videoUrlData } = supabase.storage.from('videos').getPublicUrl(videoStoragePath);
      videoUrl = videoUrlData.publicUrl;
      console.log(`   └─ Video uploaded to Supabase: ${videoStoragePath}`);
    } else {
      console.log(`   └─ Video upload skipped (bucket may not exist): ${videoUploadError.message}`);
    }

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

    // Step 8: Generate signed URLs (expire in 1 hour for security)
    // For private buckets, signed URLs are required
    const SIGNED_URL_EXPIRY = 3600; // 1 hour

    const [videoSignedUrl, audioSignedUrl, srtSignedUrl, vttSignedUrl] = await Promise.all([
      videoUrl ? supabase.storage.from('videos').createSignedUrl(videoStoragePath, SIGNED_URL_EXPIRY) : null,
      supabase.storage.from('audio').createSignedUrl(audioStoragePath, SIGNED_URL_EXPIRY),
      supabase.storage.from('subtitles').createSignedUrl(srtPath, SIGNED_URL_EXPIRY),
      supabase.storage.from('subtitles').createSignedUrl(vttPath, SIGNED_URL_EXPIRY),
    ]);

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
      } catch { }
    }, 1000);

    // Return response with signed URLs
    // Note: videoUrl will be null if video upload failed - frontend should handle this
    res.json({
      success: true,
      videoUrl: videoSignedUrl?.data?.signedUrl || null,
      audioUrl: audioSignedUrl?.data?.signedUrl,
      subtitles: {
        srt: srtSignedUrl?.data?.signedUrl,
        vtt: vttSignedUrl?.data?.signedUrl,
        text: transcription.text,
        segments: transcription.segments,
        words: transcription.words,
      },
      // Include storage paths so frontend can request new signed URLs if needed
      storagePaths: {
        video: videoUrl ? videoStoragePath : null,
        audio: audioStoragePath,
        srt: srtPath,
        vtt: vttPath,
      },
      metadata: {
        originalFilename: req.file.originalname,
        originalSize: req.file.size,
        timestamp,
        processingTimeMs: totalTime,
        segmentCount: transcription.segments.length,
        wordCount: transcription.words?.length || 0,
        signedUrlExpiresIn: SIGNED_URL_EXPIRY,
      },
    });

  } catch (error) {
    console.error('❌ Pipeline error:', error);

    // Cleanup on error
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    } catch { }

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
      'Subtitle burn to video',
      'Supabase Storage integration',
      'All-in-one pipeline',
    ],
    endpoints: {
      process: 'POST /process-video',
      burn: 'POST /burn-subtitles',
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
