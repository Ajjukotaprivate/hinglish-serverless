# 🚀 Deploy to Railway - Step by Step

## ✅ Confirmed: Complete Flow is Ready!

Your Railway API handles **EVERYTHING**:
- Video upload → FFmpeg → RunPod → SRT → Supabase ✅
- Preview page syncs subtitles with video ✅

**Just need to deploy so FFmpeg works!**

---

## 📋 Follow These Steps (10 minutes)

### Step 1: Create GitHub Repository (2 min)

1. Open: https://github.com/new
2. **Repository name:** `hinglish-serverless`
3. **Visibility:** Private (recommended - contains credentials)
4. **DO NOT** check any boxes (no README, no .gitignore)
5. Click "Create repository"

---

### Step 2: Push Your Code (1 min)

GitHub will show you commands. Run them in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/hinglish-serverless.git
git branch -M main
git push -u origin main
```

**Replace** `YOUR_USERNAME` with your actual GitHub username.

---

### Step 3: Deploy to Railway (5 min)

1. **Open:** https://railway.app
2. **Sign Up / Login** with your GitHub account
3. **Click:** "New Project" (big purple button)
4. **Select:** "Deploy from GitHub repo"
5. **Choose:** `hinglish-serverless` from the list
6. Railway will start deploying...

---

### Step 4: Configure Railway (2 min)

**IMPORTANT:** After deployment starts, configure these settings:

#### A. Set Root Directory:
1. Click on your service
2. Go to **"Settings"** tab
3. Scroll to **"Source"**
4. Set **Root Directory:** `ffmpeg-api`
5. Click **"Save"**

#### B. Add FFmpeg Buildpack:
1. Still in Settings
2. Scroll to **"Buildpacks"**
3. Click **"Add Buildpack"**
4. Paste: `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`
5. Click **"Add"**

#### C. Add Environment Variables:
1. Go to **"Variables"** tab
2. Click **"New Variable"**
3. Add these one by one:

```
SUPABASE_URL
https://htqyhcxtutdrssedseez.supabase.co

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cXloY3h0dXRkcnNzZWRzZWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxODY3MSwiZXhwIjoyMDg1MTk0NjcxfQ.33LXl8Y7cr6rO_0ZZeGZD9Ufee_5SS4nhzA2LdK3goc

RUNPOD_API_KEY
rpa_0CEN138JZOX3GFD7DUKYW96ZJVVP647YRLHLQRAN1ekr4z

RUNPOD_ENDPOINT_ID
iw97yrnfsg28si
```

4. Click **"Add"** for each variable

---

### Step 5: Wait for Deployment

Railway will:
- ✅ Install Node.js
- ✅ Install FFmpeg (from buildpack)
- ✅ Run `npm install`
- ✅ Start your API with `node index-complete.js`

**Takes:** ~2-3 minutes

**Watch the logs** to see when it says: "✅ Ready to process videos!"

---

### Step 6: Get Your Production URL

1. Go to **"Settings"** tab
2. Scroll to **"Networking"**
3. You'll see a URL like: `https://hinglish-serverless-production-xxxx.up.railway.app`
4. **Copy this URL**

Or click **"Generate Domain"** if you want a custom subdomain.

---

### Step 7: Update HTML Files

Open `test-mvp-upload.html` and change line ~310:

```javascript
// Change from:
const RAILWAY_API_URL = 'http://localhost:3001';

// To:
const RAILWAY_API_URL = 'https://your-app.railway.app';
```

Replace with your actual Railway URL.

---

### Step 8: Test It!

1. Open `test-mvp-upload.html` in your browser
2. Select your video
3. Click "Upload & Process"
4. Watch it process on Railway (with FFmpeg!)
5. Click "Preview with Subtitles"
6. See your Hinglish subtitles! 🎉

---

## ✅ What You'll Have After Deployment

```
Production API running on Railway
    ↓
Has FFmpeg pre-installed ✅
    ↓
Extracts audio from your video ✅
    ↓
Sends to RunPod for Hinglish transcription ✅
    ↓
Generates SRT/VTT files ✅
    ↓
Stores in Supabase ✅
    ↓
Returns URLs to your HTML page ✅
    ↓
Preview shows synced Hinglish subtitles ✅
```

**Complete pipeline working end-to-end!**

---

## 💰 Cost

Railway Starter Plan:
- **$5/month** flat fee
- Includes 500GB bandwidth
- FFmpeg pre-installed
- Auto-scaling

**Perfect for MVP testing!**

---

## 🎯 Summary

**What's Already Built:**
1. ✅ Railway API (`index-complete.js`) - Complete pipeline
2. ✅ Upload page (`test-mvp-upload.html`) - User interface
3. ✅ Preview page (`test-mvp-preview.html`) - Video with subtitles
4. ✅ Git repository initialized
5. ✅ Code ready to push

**What You Need to Do:**
1. Create GitHub repo (2 min)
2. Push code (1 min)
3. Deploy to Railway (5 min)
4. Update API URL in HTML (1 min)
5. Test! (2 min)

**Total Time: ~11 minutes**

---

## 🆘 Need Help?

**Stuck on GitHub?**
- Make sure you're logged in
- Repository must be created before pushing
- Use your actual GitHub username in the push command

**Stuck on Railway?**
- Make sure you logged in with GitHub
- Repository must be pushed to GitHub first
- Check deployment logs for errors
- Verify environment variables are added

**Still having issues?**
- Let me know which step is unclear
- I can create more detailed instructions

---

**Let's get this deployed! Follow the steps above and let me know when you're done! 🚀**
