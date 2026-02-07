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
├── runpod/                  # RunPod deployment (deploy separately to RunPod)
│   ├── Dockerfile           # RunPod Docker image
│   ├── handler.py           # RunPod handler (Whisper ASR)
│   └── requirements.txt     # Python dependencies
│
├── test-mvp-upload.html     # MVP upload page
├── test-mvp-preview.html    # MVP preview with synced subtitles
├── test_runpod.py           # Test RunPod endpoint
│
├── ARCHITECTURE.md           # Architecture & pipeline docs
├── BUILD-STATUS.md           # What's built vs roadmap
└── .env.local               # Main environment variables
```

---

## 🚀 Quick Start

### Next.js App (Recommended)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env.local`
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Add `NEXT_PUBLIC_RAILWAY_API_URL` (your Railway API URL)

3. **Run Supabase migrations**
   - In Supabase Dashboard: SQL Editor → run `supabase/migrations/*.sql`
   - Create `videos` and `exports` storage buckets

4. **Start the app**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

### Legacy HTML MVP

1. **Start the Railway API**
   ```bash
   cd ffmpeg-api
   node index-complete.js
   ```

2. **Open `test-mvp-upload.html`** in your browser

3. **Upload a video** (max 50MB), wait 1-2 min, then **Preview** with subtitles

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

- **ARCHITECTURE.md** - Pipeline architecture (Railway → RunPod → Supabase)
- **BUILD-STATUS.md** - What's built vs roadmap for next phase
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
- ✅ **Next.js app** – Timeline editor, subtitle styling, export
- ✅ **Subtitle burn** – FFmpeg `POST /burn-subtitles`
- ✅ **Auth** – Email OTP, Google OAuth
- ✅ **Projects** – Save/load in Supabase
- ✅ **Credits** – User profiles, placeholder for Stripe

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
