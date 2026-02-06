# 🎬 Hinglish Subtitle Generator

A simple MVP for generating Hinglish subtitles using Railway API + RunPod ASR.

## What This Does

Upload a video → Extract audio → Transcribe to Hinglish → Preview with synced subtitles

---

## 📁 Project Structure

```
hinglish-serverless/
├── ffmpeg-api/              # Railway API - handles video processing
│   ├── index-complete.js    # Main API (video → audio → RunPod → SRT)
│   ├── .env                 # Configuration (Supabase + RunPod keys)
│   └── package.json         # Dependencies
│
├── test-mvp-upload.html     # Upload page - select video & process
├── test-mvp-preview.html    # Preview page - video with synced subtitles
├── TESTING-GUIDE.md         # How to test the MVP
│
├── runpod/                  # RunPod deployment (deploy separately to RunPod)
│   ├── Dockerfile          # RunPod Docker image
│   ├── handler.py          # RunPod handler (Whisper ASR)
│   └── requirements.txt    # Python dependencies
├── test_runpod.py          # Test RunPod endpoint
│
├── output.srt              # Sample output (Hinglish subtitles)
├── output_words.json       # Word-level timestamps
│
└── .env.local              # Main environment variables
```

---

## 🚀 Quick Start

### 1. Start the Railway API

```bash
cd ffmpeg-api
node index-complete.js
```

Should see: "✅ Ready to process videos!"

### 2. Open Upload Page

Double-click `test-mvp-upload.html` in your browser

### 3. Upload a Video

- Select a video (max 50MB)
- Click "Upload & Process"
- Wait 1-2 minutes

### 4. Preview Subtitles

Click "Preview Video with Subtitles" to see synced Hinglish subtitles!

---

## 📋 What Each Part Does

### Railway API (`ffmpeg-api/`)
- Accepts video uploads
- Extracts audio with FFmpeg (16kHz mono)
- Sends to RunPod for transcription
- Generates SRT/VTT files
- Stores everything in Supabase
- Returns URLs to frontend

### RunPod (Docker)
- `Dockerfile` - RunPod serverless image
- `handler.py` - Whisper-Hindi2Hinglish-Apex model
- `test_runpod.py` - Test the endpoint

### Frontend (HTML)
- `test-mvp-upload.html` - Upload interface
- `test-mvp-preview.html` - Video player with subtitle overlay

---

## ⚙️ Configuration

### Railway API (`.env`)
```env
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
RUNPOD_API_KEY=your_key
RUNPOD_ENDPOINT_ID=your_endpoint
```

### Main Config (`.env.local`)
Contains all Supabase and RunPod credentials

---

## 🎯 Architecture

```
Video Upload (50MB max)
    ↓
Railway API (Node.js)
    ↓
FFmpeg (Extract Audio)
    ↓
RunPod ASR (Hinglish Transcription)
    ↓
SRT/VTT Generation
    ↓
Supabase Storage
    ↓
Preview with Synced Subtitles
```

---

## 📖 Documentation

- **TESTING-GUIDE.md** - Complete testing instructions
- **ffmpeg-api/README.md** - API documentation

---

## ✅ What Works

- ✅ Video upload (50MB limit)
- ✅ Audio extraction with FFmpeg
- ✅ Hinglish transcription via RunPod
- ✅ SRT/VTT generation
- ✅ Supabase Storage integration
- ✅ Preview with synced subtitles
- ✅ Word-level timestamps

---

## 🚧 What's Next

1. **Timeline Editor** - Edit subtitle text and timing
2. **Subtitle Burning** - Export video with burned subtitles
3. **Next.js App** - Production-ready interface
4. **Authentication** - User accounts
5. **Payment System** - Credit-based pricing

---

## 💰 Current Stack

- **Backend:** Railway API (Node.js + Express)
- **Storage:** Supabase Storage
- **Transcription:** RunPod Serverless GPU (Whisper model)
- **Frontend:** Simple HTML (MVP)

**Cost:** ~$10-15/month (Railway + RunPod usage)

---

## 🔧 Requirements

- Node.js 18+
- FFmpeg (for local testing)
- Supabase account
- RunPod account with deployed endpoint

---

## 📝 License

MIT
