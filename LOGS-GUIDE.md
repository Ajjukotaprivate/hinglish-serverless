# 📋 Where to See Logs - Step by Step

## Yes - Railway Automatically Sends Audio to RunPod

The flow is **fully automatic**:

```
1. Video uploaded to Railway
2. Railway extracts audio (FFmpeg)
3. Railway sends audio (base64) to RunPod API
4. RunPod transcribes (cold start if worker was idle)
5. RunPod returns Hinglish + timestamps
6. Railway generates SRT
7. Railway uploads to Supabase
8. Returns SRT URL to you
```

---

## Where to See Logs

### Railway Logs (All Steps 1-8)

**Location:** Railway Dashboard → Your Project → **Deployments** tab → Click latest deployment → **View Logs**

**What you'll see:**

```
============================================================
[2026-02-06T...] NEW REQUEST: videoplayback (1).mp4 (3.31 MB)
============================================================

========== STEP 1 ==========
[timestamp] Extracting audio with FFmpeg (16kHz mono WAV)...
[timestamp] Audio extracted successfully [2.3s]

========== STEP 2 ==========
[timestamp] Encoding audio to base64 for RunPod...
[timestamp] Audio encoded (420.5 KB base64) [0.1s]

========== STEP 3 ==========
[timestamp] Uploading audio to Supabase Storage...
[timestamp] Audio uploaded to Supabase: test-user/audio/... [1.2s]

========== STEP 4 ==========
[timestamp] Sending audio to RunPod serverless endpoint...
   └─ POST to RunPod API (endpoint: iw97yrnfsg28si)
   └─ Job submitted: abc-123-xyz
   └─ Polling for result (IN_QUEUE = cold start, IN_PROGRESS = transcribing)...
   └─ [3.0s] RunPod: IN_QUEUE (cold start - GPU worker spinning up)
   └─ [6.0s] RunPod: IN_QUEUE (cold start - GPU worker spinning up)
   └─ [9.0s] RunPod: IN_PROGRESS (transcribing with Whisper model)
   └─ [12.0s] RunPod: IN_PROGRESS (transcribing with Whisper model)
   └─ [15.0s] RunPod: COMPLETED (done!)
[timestamp] Transcription done: 23 segments, 200 words [45.2s]

========== STEP 5 ==========
[timestamp] Generating SRT and VTT subtitle files...
[timestamp] SRT/VTT generated (1234 chars) [0.0s]

========== STEP 6 ==========
[timestamp] Uploading SRT and VTT to Supabase Storage...
[timestamp] Subtitles uploaded to Supabase [0.5s]

============================================================
[timestamp] PIPELINE COMPLETE! Total: 52.30s
   SRT URL ready | Segments: 23 | Words: 200
============================================================
```

---

### RunPod Logs (Step 4 - Transcription Only)

**Location:** RunPod Dashboard → **Serverless** → Your Endpoint → **Logs** tab

**What you'll see:**
- When worker receives the job
- Model loading (if cold start)
- Transcription progress
- When job completes

**Cold Start:** When RunPod status is `IN_QUEUE`, the GPU worker is spinning up. This can take 30-90 seconds. Once warm, subsequent requests are faster.

---

## RunPod Status Meanings

| Status      | What's Happening                                      |
|------------|--------------------------------------------------------|
| **IN_QUEUE**   | Job waiting - GPU worker may be cold starting (30-90s) |
| **IN_PROGRESS**| Worker is transcribing with Whisper model              |
| **COMPLETED**  | Done! Hinglish text + timestamps returned              |
| **FAILED**     | Error - check RunPod logs for details                  |

---

## Timeline Example (3 min video)

| Step | What Happens              | Typical Time |
|------|---------------------------|--------------|
| 1    | FFmpeg extracts audio     | 2-5 sec      |
| 2    | Encode to base64          | <1 sec       |
| 3    | Upload to Supabase        | 1-3 sec      |
| 4    | RunPod (cold start)       | 45-90 sec    |
| 4    | RunPod (warm)             | 15-30 sec    |
| 5    | Generate SRT              | <1 sec       |
| 6    | Upload SRT to Supabase    | <1 sec       |

**Total (cold start):** ~60-120 seconds  
**Total (warm):** ~25-45 seconds

---

## How to Watch Logs Live

1. **Open Railway Dashboard** in one tab
2. **Go to Deployments → View Logs**
3. **Open your upload page** in another tab
4. **Upload a video**
5. **Watch Railway logs** - they stream in real-time as each step completes

---

## Summary

- **Railway logs** = Full pipeline (Steps 1-8)
- **RunPod logs** = Transcription only (Step 4)
- **Cold start** = IN_QUEUE for 30-90 sec
- **Warm** = IN_PROGRESS within seconds
