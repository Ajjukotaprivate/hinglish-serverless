---
trigger: always_on
---

---
alwaysApply: true
---

# Project Context

You are helping build a **Viral Subtitle Editor / Hinglish Caption Generator** — SaaS similar to SubtitlesFast for Indian creators.

## Vision

Upload video → extract audio (FFmpeg) → transcribe to Hinglish (RunPod) → timeline editor → viral TikTok-style caption styling → paywall export → burn subtitles (FFmpeg) → final MP4.

## Current Architecture (Built)

- **Railway API** (`ffmpeg-api/`): Node.js + FFmpeg. Single `POST /process-video` — upload, extract audio, call RunPod, generate SRT/VTT, upload to Supabase.
- **RunPod**: Serverless Whisper-Hindi2Hinglish-Apex + WhisperX. Custom Docker.
- **Supabase**: Storage for audio, SRT/VTT, exports. Auth and DB planned.
- **MVP frontend**: `test-mvp-upload.html`, `test-mvp-preview.html` — HTML test pages until Next.js.

## Next Phase (See BUILD-STATUS.md)

1. Timeline editor (SubtitlesFast-style)
2. Subtitle burning (FFmpeg export)
3. Next.js app
4. Auth + credits + paywall

## Constraints

- Payment is credit-based.
- Worker warm-up via dummy audio to reduce cold starts.
- Entire pipeline must maintain perfect A/V sync.
- For full spec and roadmap: **ARCHITECTURE.md**, **BUILD-STATUS.md**.
