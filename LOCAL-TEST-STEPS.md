# 🧪 Local Testing Guide

## ✅ Your Railway API is Running!

**Status:** Server is live on `http://localhost:3001`

---

## 📋 Testing Steps (Follow These)

### Step 1: Upload Page is Open
The `test-mvp-upload.html` page should have opened in your browser.

If not, manually open it:
- Navigate to: `c:\hinglish-serverless`
- Double-click: `test-mvp-upload.html`

---

### Step 2: Select a Test Video

You have a test file ready:
- **File:** `videoplayback-[AudioTrimmer.com].mp3` 
- **Location:** `c:\hinglish-serverless\`
- **Size:** Under 50MB ✅

**Steps:**
1. Click "📁 Click to select video file"
2. Browse to `c:\hinglish-serverless`
3. Select `videoplayback-[AudioTrimmer.com].mp3`
4. You'll see: "✓ videoplayback-[AudioTrimmer.com].mp3 (XX MB)"

---

### Step 3: Upload & Process

1. Click the **"🚀 Upload & Process"** button
2. Watch the progress:
   - ⏳ Uploading video... (10%)
   - ⏳ Extracting audio with FFmpeg... (30%)
   - ⏳ Processing complete! (100%)

**Expected Time:** 1-2 minutes

**What's Happening:**
```
Your Video
    ↓
Railway API (localhost:3001)
    ↓
FFmpeg extracts audio (16kHz mono)
    ↓
Audio sent to RunPod (base64)
    ↓
RunPod Whisper model transcribes to Hinglish
    ↓
SRT/VTT files generated
    ↓
Everything uploaded to Supabase Storage
    ↓
URLs returned to browser
```

---

### Step 4: Check Results

Once processing completes, you'll see:

**✅ Processing Complete!**

- **Video URL:** Link to audio file in Supabase
- **SRT URL:** Link to subtitle file
- **VTT URL:** Link to WebVTT file
- **Statistics:** 
  - Segments: ~23
  - Words: ~200
  - Processing time: ~45-60 seconds

---

### Step 5: Preview with Subtitles!

1. Click the **"👁️ Preview Video with Subtitles"** button
2. A new tab will open with the video player
3. **Click Play** ▶️
4. **Watch the magic happen:**
   - Video plays
   - Hinglish subtitles appear at the bottom
   - Subtitles sync perfectly with audio timing
   - Try seeking - subtitles update instantly!

**Keyboard Controls:**
- **Space** = Play/Pause
- **Arrow Left** = Seek backward 5 seconds
- **Arrow Right** = Seek forward 5 seconds

---

## 🎯 Expected Output

### Sample Hinglish Transcription:
```
"Are jo bhi maleism jo bhi haan kya kya anshul naam hai aapka"
"Software engineer. Matlab ismen aap kya vah aap app bana rahe hain"
"website bana rahe hain ya aapko test kar rahe hain"
```

### Statistics:
- **Segments:** ~23 subtitle segments
- **Words:** ~200 words with individual timestamps
- **Accuracy:** Mix of English and Hindi (Hinglish)
- **Timing:** Perfect sync with audio

---

## ❌ Troubleshooting

### Issue: Page doesn't load
**Solution:** 
- Make sure you opened `test-mvp-upload.html` in a modern browser (Chrome, Edge, Firefox)
- Try refreshing the page

### Issue: "Cannot connect to server"
**Solution:**
- Check Railway API is still running in terminal
- Should see: "✅ Ready to process videos!"
- If not running: 
  ```bash
  cd ffmpeg-api
  node index-complete.js
  ```

### Issue: "File too large" error
**Solution:**
- File must be under 50MB
- The test file `videoplayback-[AudioTrimmer.com].mp3` is already the right size

### Issue: Processing takes forever
**Solution:**
- First time RunPod processing can take 1-2 minutes (cold start)
- Check Railway API terminal for logs
- Look for any error messages

### Issue: No subtitles in preview
**Solution:**
- Press F12 to open browser console
- Check for JavaScript errors
- Verify SRT URL is accessible (click the link)

---

## 🎉 Success Checklist

When testing is successful, you should see:

- [x] Upload page loads
- [x] Can select video file
- [x] File size displays correctly
- [x] Upload starts without errors
- [x] Progress bar shows status
- [x] Processing completes (~1-2 min)
- [x] Results show 3 URLs (video, SRT, VTT)
- [x] Statistics display correctly
- [x] Preview button works
- [x] Video plays in preview
- [x] Subtitles appear and sync
- [x] Can seek and subtitles update
- [x] Hinglish text is readable

---

## 📸 What You Should See

### Upload Page Results:
```
✅ Processing Complete!

Video URL: https://htqyhcxtutdrssedseez.supabase.co/storage/v1/object/public/audio/...
SRT URL: https://htqyhcxtutdrssedseez.supabase.co/storage/v1/object/public/subtitles/...srt
VTT URL: https://htqyhcxtutdrssedseez.supabase.co/storage/v1/object/public/subtitles/...vtt

📊 Details:
Segments: 23
Words: 200
Processing time: 52.3s
```

### Preview Page:
- Black background
- Video player in center
- Subtitle text at bottom in white box
- Current segment indicator
- Total segments count

---

## 🚀 Next Steps After Testing

Once local testing works:

1. **✅ Core pipeline validated** - Video → Audio → Hinglish → Subtitles works!

2. **Deploy to Railway:**
   - Push code to GitHub
   - Connect to Railway
   - Set environment variables
   - Get production URL

3. **Update HTML files:**
   - Change `http://localhost:3001` to Railway URL
   - Deploy frontend to Vercel/Netlify

4. **Build Full App:**
   - Timeline editor
   - Subtitle editing
   - Export with burned subtitles
   - User authentication

---

## 💡 Tips

- **Keep Railway API running** in the terminal while testing
- **Test with different videos** to verify it works consistently
- **Check Supabase dashboard** to see uploaded files
- **Monitor RunPod usage** to track costs
- **Save the SRT URLs** for later reference

---

## 📞 Need Help?

If something doesn't work:
1. Check Railway API terminal for error messages
2. Open browser console (F12) for JavaScript errors
3. Verify all environment variables are set correctly
4. Make sure Supabase buckets exist (audio, subtitles)
5. Test RunPod endpoint separately with `test_runpod.py`

---

**Happy Testing! 🎬**

Your MVP core flow is ready to test. Once this works, you're ready to deploy and build the full application!
