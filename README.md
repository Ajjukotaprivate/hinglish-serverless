# 🎬 Hinglish Subtitle Editor

> **AI-powered subtitle generation & viral caption editor for Indian video creators.**  
> Upload video → GPU transcription → timeline editor → TikTok-style styling → export MP4 with burned captions.

---

## 🧭 What Is This?

**Hinglish Subtitle Editor** is a full-stack SaaS product built for the Indian creator economy — similar to [SubtitlesFast](https://subtitlesfast.com) but purpose-built for **Hinglish content** (Hindi spoken, romanised English captions).

Indian creators on YouTube, Instagram Reels and YouTube Shorts often produce content in Hinglish but lack tools that understand the language well enough to auto-caption it accurately. This project solves that gap with a custom AI pipeline layered over a full editing experience.

---

## 👥 Who Is It For?

| Audience | Use Case |
|----------|----------|
| **YouTube / Reels creators** | Auto-generate accurate Hinglish captions without manually typing them |
| **Podcast editors** | One-click transcription + subtitle file export (SRT/VTT) |
| **Short-form video teams** | Apply viral TikTok-style caption styling and export burned MP4 |
| **Indie SaaS builders** | Reference architecture for GPU-backed video processing pipelines |

---

## ✨ Key Features

- 🎙️ **Hinglish ASR** — Custom Whisper model fine-tuned on Hindi → Hinglish transliteration, with word-level timestamps via WhisperX
- 🖥️ **Timeline Editor** — SubtitlesFast-style multi-track editor (video / subtitle / audio / overlay tracks) built in Next.js
- 🎨 **Viral Caption Styling** — Font, color, stroke, background, word-highlighting, and animation presets
- ✂️ **Subtitle List Editor** — Edit, merge, split, add, or delete individual subtitle segments
- 🔥 **Server-side Subtitle Burning** — FFmpeg + ASS rendering on Railway for pixel-perfect caption burn-in
- 📦 **Export** — SRT, VTT, or MP4 with burned subtitles
- 💾 **Project Save / Load** — Supabase-backed project persistence with auto-save
- 🔐 **Auth** — Email OTP + Google OAuth via Supabase Auth
- 💳 **Credits System** — Usage-based paywall, Stripe-ready

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐     ┌───────────────┐
│  Next.js    │────▶│  Railway API          │────▶│  RunPod GPU  │────▶│   Supabase    │
│  Frontend   │     │  Node.js + FFmpeg     │     │  Whisper ASR │     │   Storage/DB  │
└─────────────┘     └──────────────────────┘     └──────────────┘     └───────────────┘
      │                       │                          │                      │
  Timeline editor        POST /process-video        Hinglish segments      Audio, SRT, VTT,
  Subtitle styling        POST /burn-subtitles       + word timestamps       Projects, Users
  Export modal           FFmpeg audio extract
```

### End-to-End Pipeline

| Step | Where | What Happens |
|------|-------|--------------|
| 1 | **Browser** | User uploads MP4 / MOV |
| 2 | **Railway** | Multer receives file; FFmpeg extracts 16kHz mono WAV |
| 3 | **Railway** | Audio encoded to base64, POSTed to RunPod `/run` |
| 4 | **RunPod** | Whisper-Hindi2Hinglish-Apex transcribes audio |
| 5 | **RunPod** | WhisperX aligns word-level timestamps |
| 6 | **Railway** | SRT / VTT generated from segment data |
| 7 | **Supabase** | Audio, SRT, VTT uploaded; public URLs returned |
| 8 | **Browser** | Next.js editor loads video + subtitles into timeline |
| 9 | **Railway** | On export: FFmpeg burns subtitles into MP4 (ASS renderer) |
| 10 | **Supabase** | Final MP4 stored; user downloads |

---

## 🛠️ Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 14** (App Router) |
| Language | **TypeScript** |
| State Management | **Zustand** |
| Styling | **Tailwind CSS** |
| Auth Client | **Supabase SSR** |

### Backend
| Layer | Technology |
|-------|-----------|
| API Server | **Node.js + Express** on Railway |
| Video/Audio | **FFmpeg** — extraction, subtitle burning (ASS) |
| File Handling | **Multer** (multipart uploads) |
| Storage Client | **Supabase JS** |

### AI / ML
| Component | Technology |
|-----------|-----------|
| Model | **Whisper-Hindi2Hinglish-Apex** (custom fine-tuned) |
| Alignment | **WhisperX** for word-level timestamps |
| Runtime | **CUDA** on RunPod A100 / RTX 4090 |
| Serving | **RunPod Serverless** (GPU-on-demand) |
| Container | **Custom Docker** image |

### Infrastructure
| Service | Role |
|---------|------|
| **Railway** | Node.js API hosting + FFmpeg |
| **RunPod** | Serverless GPU inference |
| **Supabase** | PostgreSQL, Blob Storage, Auth |

---

## 📂 Project Structure

```
hinglish-serverless/
│
├── app/                        # Next.js App Router (pages, API routes)
├── components/
│   ├── timeline/               # Multi-track timeline (VideoTrack, AudioTrack, OverlayTrack, TimeRuler)
│   ├── subtitles/              # Subtitle list editor
│   ├── style/                  # Caption style panel (fonts, colors, animations)
│   ├── export/                 # Export modal (SRT / MP4)
│   ├── media/                  # Media upload panel
│   ├── editor/                 # Main editor layout
│   └── layout/                 # Shell, sidebar, nav
├── lib/
│   └── store.ts                # Zustand global state
│
├── ffmpeg-api/                 # Railway backend (Node.js)
│   └── index-complete.js       # POST /process-video + POST /burn-subtitles
│
├── runpod/                     # GPU worker (Python)
│   ├── handler.py              # WhisperX Hinglish handler
│   ├── Dockerfile              # RunPod serverless image
│   └── requirements.txt
│
├── supabase/                   # DB migrations + RLS policies
├── ARCHITECTURE.md             # Detailed pipeline docs
└── BUILD-STATUS.md             # Feature tracker & roadmap
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- RunPod account with deployed endpoint
- Railway account (or local FFmpeg for dev)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_RAILWAY_API_URL=
SUPABASE_SERVICE_ROLE_KEY=
RUNPOD_API_KEY=
RUNPOD_ENDPOINT_ID=
```

### 3. Run Supabase migrations
In your Supabase Dashboard → SQL Editor → run files in `supabase/migrations/`

### 4. Start the dev server
```bash
npm run dev
# open http://localhost:3000
```

### 5. Start the Railway API locally (optional)
```bash
cd ffmpeg-api
node index-complete.js
```

---

## 🧠 Engineering Highlights

- **Custom Hinglish ASR pipeline** — built and deployed a custom RunPod Docker image using Whisper + WhisperX with a Hindi→Hinglish transliteration model.  
- **Word-level timestamp alignment** — WhisperX aligns every word to a precise start/end time, enabling word-highlight animation in captions.
- **Server-side subtitle burning** — captions are burned server-side on Railway via FFmpeg's ASS subtitle renderer to ensure consistent visual output across all devices (no canvas hacks).
- **Serverless GPU cost model** — RunPod only bills per GPU-second; designed warm-up strategy for cold start mitigation.
- **A/V sync guarantee** — timestamps flow from RunPod → SRT → frontend timeline → burned ASS captions without re-encoding the video stream, preserving original quality.
- **Multi-track Zustand state** — editor state (video, subtitles, playhead, style settings, project) is managed in a single Zustand store with `immer` patterns for immutable segment updates.

---

## 📍 Roadmap

- [x] Upload → transcribe → SRT/VTT pipeline  
- [x] Supabase Storage + Auth  
- [x] Next.js editor shell + timeline components  
- [x] Subtitle style panel  
- [x] FFmpeg subtitle burn endpoint  
- [ ] Credits system + Stripe integration  
- [ ] Silence detection & filler-word removal  
- [ ] Auto-zoom on speaker face  
- [ ] Admin dashboard with usage analytics  
- [ ] CDN + GPU warm-up for sub-10s cold starts  

---

## 💰 Infrastructure Cost

| Service | Cost |
|---------|------|
| Railway (API) | ~$5/month |
| RunPod (GPU) | Pay-per-second (billed on use) |
| Supabase | Free tier → ~$25/month at scale |

**Target:** ₹10–₹49 per video export (Indian creator pricing).

---

## 📄 License

MIT — free to fork and adapt.

---

*Built by [@Ajjukota](https://github.com/Ajjukotaprivate) — Full Stack AI Developer.*
