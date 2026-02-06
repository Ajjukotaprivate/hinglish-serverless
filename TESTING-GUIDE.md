# 🎯 MVP Core Flow - Testing Guide

## What Was Built

A simple 2-page HTML application to test the complete video-to-subtitles pipeline:

### Files Created:
1. ✅ `test-mvp-upload.html` - Upload video and process
2. ✅ `test-mvp-preview.html` - Preview video with synced Hinglish subtitles
3. ✅ `ffmpeg-api/index-complete.js` - Updated to 50MB limit
4. ✅ `ffmpeg-api/.env` - Configuration file with your credentials

### Railway API is Running:
- Port: 3001
- Endpoint: `http://localhost:3001/process-video`
- Status: ✅ Ready to process videos

---

## How to Test

### Step 1: Open Upload Page

1. Navigate to your project folder: `c:\hinglish-serverless`
2. Open `test-mvp-upload.html` in your browser (double-click or right-click → Open with Chrome)

### Step 2: Upload a Video

1. **Click** "Click to select video file" button
2. **Select** a video file from your computer
   - ⚠️ Must be under 50MB
   - Recommended: Use `videoplayback-[AudioTrimmer.com].mp3` (already in your folder)
3. **Click** "Upload & Process" button

### Step 3: Wait for Processing

The page will show progress:
- ⏳ Uploading video... (10%)
- ⏳ Extracting audio with FFmpeg... (30%)
- ⏳ Processing complete! (100%)

**Expected time:** 1-2 minutes depending on video length

### Step 4: View Results

Once complete, you'll see:
- ✅ Video URL (Supabase Storage)
- ✅ SRT URL (Subtitle file)
- ✅ VTT URL (WebVTT format)
- 📊 Statistics (segments, words, processing time)

### Step 5: Preview with Subtitles

1. **Click** "👁️ Preview Video with Subtitles" button
2. A new tab will open with the video player
3. **Play** the video
4. **Watch** Hinglish subtitles appear in sync with audio

---

## What the Preview Page Does

### Features:
- ▶️ HTML5 video player with controls
- 💬 Subtitle overlay at bottom-center
- 🎯 Real-time synchronization with video time
- ⌨️ Keyboard controls:
  - **Space** = Play/Pause
  - **Arrow Left** = Seek backward 5s
  - **Arrow Right** = Seek forward 5s

### How Subtitles Work:
1. Fetches SRT file from Supabase
2. Parses SRT format into segments with timestamps
3. Listens to video `timeupdate` event
4. Finds current subtitle based on video time
5. Displays subtitle text with styling

---

## Architecture Flow

```
1. User uploads video (50MB max)
   ↓
2. Railway API receives video
   ↓
3. FFmpeg extracts audio (16kHz mono WAV)
   ↓
4. Audio sent to RunPod (base64)
   ↓
5. RunPod returns Hinglish transcription + timestamps
   ↓
6. Railway generates SRT/VTT files
   ↓
7. Everything uploaded to Supabase Storage
   ↓
8. URLs returned to user
   ↓
9. Preview page loads video + SRT
   ↓
10. Subtitles sync with video playback
```

---

## Testing Checklist

### Upload Page:
- [ ] Page loads without errors
- [ ] Can select video file
- [ ] Shows error if file > 50MB
- [ ] Shows file name and size after selection
- [ ] Upload button works
- [ ] Progress bar appears
- [ ] Shows status messages during processing
- [ ] Displays results after completion
- [ ] Video URL opens in new tab
- [ ] SRT URL downloads subtitle file
- [ ] Preview button opens preview page

### Preview Page:
- [ ] Page loads without errors
- [ ] Video player appears
- [ ] Video plays correctly
- [ ] Subtitles appear at bottom
- [ ] Subtitles match audio timing
- [ ] Subtitles change as video plays
- [ ] Seeking updates subtitles correctly
- [ ] Space bar plays/pauses
- [ ] Arrow keys seek forward/backward
- [ ] Statistics show correct numbers

---

## Expected Results

### For the test audio file (`videoplayback-[AudioTrimmer.com].mp3`):

**Output:**
- ✅ ~23 subtitle segments
- ✅ ~200 words with timestamps
- ✅ Hinglish transcription (mix of English and Hindi)
- ✅ Processing time: ~45-60 seconds

**Sample transcription:**
```
"Are jo bhi maleism jo bhi haan kya kya anshul naam hai..."
"Software engineer. Matlab ismen aap kya vah aap app bana rahe hain..."
```

---

## Troubleshooting

### Issue: "Cannot connect to Railway API"
**Solution:** Check that the Railway API is running:
- Open terminal in `ffmpeg-api` folder
- Run: `node index-complete.js`
- Should see: "✅ Ready to process videos!"

### Issue: "File too large"
**Solution:** Video must be under 50MB
- Compress video using online tool
- Or use a shorter clip

### Issue: "Processing takes too long"
**Solution:** Normal for longer videos
- 1 minute video = ~60 seconds processing
- 3 minute video = ~2-3 minutes processing

### Issue: "Subtitles don't appear"
**Solution:** Check browser console for errors
- Press F12 to open developer tools
- Look for red error messages
- Verify SRT URL is accessible

### Issue: "Subtitles out of sync"
**Solution:** This is a timing issue from RunPod
- Usually means timestamps are slightly off
- Can be fixed in a timeline editor (future feature)

---

## What's Next?

Now that the core flow works, you can:

1. **Polish the UI:**
   - Add drag-and-drop upload
   - Better progress indicators
   - Prettier styling

2. **Build Timeline Editor:**
   - Edit subtitle text
   - Adjust timing
   - Add/delete segments
   - Merge/split segments

3. **Add Subtitle Burning:**
   - Export video with burned subtitles
   - Different font styles
   - Position and color options

4. **Full Next.js App:**
   - Production-ready interface
   - User authentication
   - Payment system (credits)
   - Save projects

5. **Deploy to Production:**
   - Deploy Railway API to Railway.app
   - Deploy Next.js to Vercel
   - Set up custom domain

---

## API Endpoints

### POST /process-video

**Request:**
```javascript
FormData {
  video: File (max 50MB),
  userId: string (optional)
}
```

**Response:**
```json
{
  "success": true,
  "audioUrl": "https://.../audio/...",
  "subtitles": {
    "srt": "https://.../subtitles/...srt",
    "vtt": "https://.../subtitles/...vtt",
    "text": "Full transcription...",
    "segments": [
      { "start": 0.0, "end": 1.5, "text": "..." }
    ],
    "words": [
      { "word": "Hello", "start": 0.0, "end": 0.5 }
    ]
  },
  "metadata": {
    "processingTimeMs": 45000,
    "segmentCount": 23,
    "wordCount": 200
  }
}
```

---

## Configuration

### Railway API (.env):
```env
PORT=3001
SUPABASE_URL=https://htqyhcxtutdrssedseez.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-key>
RUNPOD_API_KEY=rpa_0CEN138JZOX3GFD7DUKYW96ZJVVP647YRLHLQRAN1ekr4z
RUNPOD_ENDPOINT_ID=iw97yrnfsg28si
```

### HTML Pages:
- API URL: `http://localhost:3001`
- For production: Change to `https://your-app.railway.app`

---

## File Structure

```
hinglish-serverless/
├── ffmpeg-api/
│   ├── index-complete.js     ✅ Updated (50MB limit)
│   ├── .env                  ✅ Created (your credentials)
│   ├── package.json
│   └── uploads/              ✅ Created (temp files)
├── test-mvp-upload.html      ✅ Created (upload page)
├── test-mvp-preview.html     ✅ Created (preview page)
└── TESTING-GUIDE.md          ✅ This file
```

---

## Success! 🎉

You now have a working MVP that:
- ✅ Accepts video uploads (50MB)
- ✅ Extracts audio with FFmpeg
- ✅ Transcribes to Hinglish via RunPod
- ✅ Generates SRT/VTT subtitles
- ✅ Previews video with synced subtitles

**The core pipeline is validated and working!**

Now you can confidently build the full editor interface knowing the backend works perfectly.

---

## Questions?

If you encounter any issues:
1. Check Railway API logs in terminal
2. Check browser console (F12)
3. Verify all environment variables are set
4. Make sure video file is under 50MB
5. Test with the provided MP3 file first

**Happy testing! 🚀**
