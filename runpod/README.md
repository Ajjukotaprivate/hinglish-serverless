# RunPod Serverless Endpoint

This folder contains the RunPod serverless deployment for the Whisper-Hindi2Hinglish-Apex model.

**Deploy this to RunPod separately** - it is NOT deployed via Railway or GitHub.

Railway only sends audio to your RunPod endpoint via API. This code runs on RunPod's GPU infrastructure.

## Files

- `Dockerfile` - RunPod container image
- `handler.py` - Receives audio, returns Hinglish transcription + timestamps
- `requirements.txt` - Python dependencies

## Deploy to RunPod

1. Go to RunPod dashboard
2. Create Serverless Endpoint
3. Use this Dockerfile (from runpod/ folder)
4. Get your endpoint ID and API key
5. Add to Railway's environment variables

## Note

Railway does NOT use this folder. Railway only uses `ffmpeg-api/`.
