# Architecture: Railway → RunPod → Supabase

## Overview

The Hinglish subtitle pipeline orchestrates three services: **Railway** (API + FFmpeg), **RunPod** (GPU transcription), and **Supabase** (storage). The Railway API is the single entry point that handles the full flow.

---

## What's Built / What's Working (Foundation)

This is the current MVP we're building on top of.

| Component | Status | Details |
|-----------|--------|---------|
| **Video upload** | ✅ Done | 50MB max; `.mp4`, `.mov`, `video/*`; Multer on Railway |
| **Audio extraction** | ✅ Done | FFmpeg → 16kHz mono WAV; distinct output path (no overwrite) |
| **Hinglish transcription** | ✅ Done | RunPod serverless; Whisper-Hindi2Hinglish-Apex + WhisperX |
| **SRT/VTT generation** | ✅ Done | Segment-level timestamps; word-level JSON optional |
| **Supabase Storage** | ✅ Done | Audio + subtitles buckets; public URLs |
| **Preview with sync** | ✅ Done | `test-mvp-preview.html` — video + SRT overlay, A/V sync |
| **Deploy** | ✅ Done | Railway (`ffmpeg-api/`); RunPod endpoint live |

**Frontend (MVP):**

- `test-mvp-upload.html` — file picker, upload, progress, results
- `test-mvp-preview.html` — video player, SRT parser, subtitle overlay

**Backend:**

- `ffmpeg-api/index-complete.js` — single `POST /process-video` pipeline
- `runpod/handler.py` — custom Hinglish ASR on GPU

---

## What We're Building On Top

1. **Timeline Editor** — Edit subtitle text and timing (SubtitlesFast-style)
2. **Subtitle Burning** — **SERVER-SIDE** on Railway via FFmpeg + ASS (fonts, outline, TikTok-style). Never in browser.
3. **Next.js App** — Production-ready interface
4. **Authentication** — User accounts (Supabase Auth)
5. **Payment System** — Credit-based pricing, paywall export

---

## High-Level Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User/Browser  │────▶│  Railway API     │────▶│    RunPod       │────▶│    Supabase     │
│  (HTML upload)  │     │  (Node.js+FFmpeg)│     │  (GPU Whisper)  │     │  (Storage)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │                        │
         │  1. POST video         │  2. Send base64        │  3. Hinglish text      │
         │                        │     audio              │     + timestamps       │
         │                        │                        │                        │
         │                        │  4. Upload audio,      │                        │
         │                        │     SRT, VTT           │                        │
         │◀───────────────────────────────────────────────────────────────────────│
         │  5. Return URLs (video, SRT, VTT)
```

---

## 1. Railway (Orchestrator + FFmpeg)

**Role:** Central API that receives video, runs FFmpeg, calls RunPod, and uploads to Supabase.

**What it does:**

- Exposes `POST /process-video` and accepts Multipart uploads (max 50MB)
- Runs FFmpeg to extract audio: 16kHz mono WAV (PCM)
- Encodes audio to base64 for RunPod
- Sends audio to RunPod transcription API
- Builds SRT/VTT from RunPod segments
- Uploads audio + SRT/VTT to Supabase Storage
- Returns public URLs for the frontend

**Stack:** Node.js, Express, Multer, FFmpeg, Supabase client.

---

## 2. RunPod (GPU Transcription)

**Role:** Serverless GPU endpoint that transcribes audio to Hinglish with word-level timestamps.

**What it does:**

- Receives base64 audio
- Runs **Whisper-Hindi2Hinglish-Apex** for Hinglish transcription
- Uses **WhisperX** for word-level alignment
- Returns JSON with `text`, `segments` (start/end), and `words` (word-level timestamps)

**Stack:** Python, Hugging Face Whisper, WhisperX, CUDA.

**Flow:** Railway POSTs to RunPod → RunPod runs transcription → returns result. Railway polls RunPod status until job completes.

---

## 3. Supabase (Storage)

**Role:** Persists all generated assets and exposes public URLs.

**What it stores:**

| Bucket      | Path Pattern                              | Contents                     |
|-------------|-------------------------------------------|------------------------------|
| `audio`     | `{userId}/audio/{timestamp}-audio.wav`     | Extracted 16kHz mono WAV     |
| `subtitles` | `{userId}/subtitles/{timestamp}.srt`       | SRT format                   |
| `subtitles` | `{userId}/subtitles/{timestamp}.vtt`      | VTT format                   |
| `subtitles` | `{userId}/subtitles/{timestamp}-words.json` | Word-level timestamps (optional) |

**Flow:** Railway uploads files after transcription and SRT/VTT generation, then returns public URLs.

---

## Step-by-Step Pipeline

| Step | Where     | Action |
|------|------------|--------|
| 1    | **User**   | Uploads video via `test-mvp-upload.html` |
| 2    | **Railway**| Receives file; Multer saves to disk |
| 3    | **Railway**| FFmpeg extracts audio → `videoPath_audio.wav` |
| 4    | **Railway**| Reads audio, encodes to base64 |
| 5    | **Railway**| Uploads audio to Supabase `audio` bucket |
| 6    | **Railway**| POSTs audio to RunPod `/run` |
| 7    | **RunPod** | Transcribes; returns segments + words |
| 8    | **Railway**| Generates SRT/VTT from segments |
| 9    | **Railway**| Uploads SRT/VTT to Supabase `subtitles` bucket |
| 10   | **Railway**| Returns JSON with public URLs |
| 11   | **User**   | Opens `test-mvp-preview.html?video=...&srt=...` |
| 12   | **Browser**| Fetches SRT from Supabase; syncs subtitles with video |

---

## Design Choices

- **Single API (Railway):** One `POST /process-video` does everything; no separate edge functions.
- **RunPod Serverless:** GPU only when needed; cold starts handled (e.g. warm-up).
- **Supabase Storage:** Central object store for all outputs; URLs used directly in the preview page.
- **A/V Sync:** Timestamps from RunPod; SRT/VTT preserve them; preview uses `video.currentTime` vs segment start/end.

---

## Cost Summary

- **Railway:** Hosting the Node.js API.
- **RunPod:** Billed per GPU-second when transcription runs.
- **Supabase:** Storage and bandwidth for audio and subtitles.
