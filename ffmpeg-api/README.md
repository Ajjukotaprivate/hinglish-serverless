# FFmpeg Audio Extraction API

Microservice that extracts audio from video files using FFmpeg.

## Features

- ✅ Accepts video uploads (MP4, MOV, AVI, etc.)
- ✅ Extracts audio as 16kHz mono WAV
- ✅ Returns audio as base64 or file download
- ✅ Optional: Forwards to Supabase Edge Function
- ✅ Automatic cleanup of temporary files
- ✅ Progress tracking
- ✅ Error handling

## Installation

```bash
npm install
```

## Local Development

```bash
# Start the server
npm start

# Or with auto-reload
npm run dev
```

Server will run on `http://localhost:3001`

## API Endpoints

### 1. Extract Audio Only

**Endpoint:** `POST /extract-audio`

**Body (multipart/form-data):**
- `video`: Video file
- `format`: `base64` | `file` (optional, default: `base64`)

**Example (cURL):**
```bash
curl -X POST http://localhost:3001/extract-audio \
  -F "video=@video.mp4" \
  -F "format=base64"
```

**Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_audio...",
  "metadata": {
    "originalFilename": "video.mp4",
    "originalSize": 10485760,
    "audioSize": 512000,
    "processingTimeMs": 3450,
    "format": "wav",
    "sampleRate": 16000,
    "channels": 1
  }
}
```

### 2. Extract and Forward to Supabase

**Endpoint:** `POST /extract-and-process`

**Body (multipart/form-data):**
- `video`: Video file
- `userId`: User ID
- `edgeFunctionUrl`: Supabase Edge Function URL
- `supabaseKey`: Supabase Anon Key

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('video', videoFile);
formData.append('userId', 'user-123');
formData.append('edgeFunctionUrl', 'https://your-project.supabase.co/functions/v1/process-video-v2');
formData.append('supabaseKey', 'your-anon-key');

const response = await fetch('http://localhost:3001/extract-and-process', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.subtitles);
```

## Deployment

### Railway (Recommended)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Deploy:
```bash
railway up
```

4. Add FFmpeg buildpack in Railway Dashboard:
   - Go to your service settings
   - Add buildpack: `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`

### Render

1. Create `render.yaml`:
```yaml
services:
  - type: web
    name: ffmpeg-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

2. Connect GitHub repo to Render
3. Deploy automatically

### Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Create `fly.toml`:
```toml
app = "ffmpeg-api"

[build]
  builder = "heroku/buildpacks:20"

[[services]]
  http_checks = []
  internal_port = 3001
  protocol = "tcp"
```

3. Deploy:
```bash
fly deploy
```

## Environment Variables

Create `.env` file:

```env
PORT=3001
NODE_ENV=production
SUPABASE_EDGE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/process-video-v2
SUPABASE_ANON_KEY=your_anon_key
```

## Requirements

- Node.js 18+
- FFmpeg (installed automatically on Railway/Render)

## Local Testing

1. Start the API:
```bash
npm start
```

2. Test with curl:
```bash
curl -X POST http://localhost:3001/extract-audio \
  -F "video=@test-video.mp4" \
  -F "format=base64" \
  | jq .
```

## Troubleshooting

### FFmpeg not found

Install FFmpeg locally:

**Windows:**
```bash
choco install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

### Memory issues

Increase Node.js memory:
```bash
node --max-old-space-size=4096 index.js
```

## Cost Estimates

- **Railway:** $5-10/month (starter plan)
- **Render:** $7/month (starter plan)
- **Fly.io:** ~$5/month (pay-as-you-go)

## License

MIT
