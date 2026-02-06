# 🚀 Deploy to Railway (Skip Local FFmpeg)

Since FFmpeg isn't installed locally, you can deploy directly to Railway where it's already available.

## Step-by-Step Deployment

### Step 1: Initialize Git Repository

```bash
cd c:\hinglish-serverless
git init
git add .
git commit -m "Initial commit: Railway API + MVP"
```

### Step 2: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `hinglish-serverless`
3. Click "Create repository"

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/hinglish-serverless.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Railway

1. **Go to:** https://railway.app
2. **Sign up/Login** with GitHub
3. **Click:** "New Project"
4. **Select:** "Deploy from GitHub repo"
5. **Choose:** `hinglish-serverless`
6. **Settings:**
   - Root Directory: `ffmpeg-api`
   - Start Command: `node index-complete.js`

### Step 5: Add FFmpeg Buildpack

1. Go to your Railway project
2. Click **"Settings"** tab
3. Scroll to **"Buildpacks"**
4. Click **"Add Buildpack"**
5. Enter: `https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git`
6. Click **"Add"**

### Step 6: Add Environment Variables

In Railway Dashboard → Variables tab, add:

```
SUPABASE_URL=https://htqyhcxtutdrssedseez.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cXloY3h0dXRkcnNzZWRzZWV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYxODY3MSwiZXhwIjoyMDg1MTk0NjcxfQ.33LXl8Y7cr6rO_0ZZeGZD9Ufee_5SS4nhzA2LdK3goc
RUNPOD_API_KEY=rpa_0CEN138JZOX3GFD7DUKYW96ZJVVP647YRLHLQRAN1ekr4z
RUNPOD_ENDPOINT_ID=iw97yrnfsg28si
```

### Step 7: Deploy!

Railway will automatically:
- Install FFmpeg
- Install Node packages
- Start your API
- Give you a URL: `https://your-app.railway.app`

### Step 8: Update HTML Files

Change the API URL in both HTML files:

**In `test-mvp-upload.html` (line ~318):**
```javascript
// Change from:
const RAILWAY_API_URL = 'http://localhost:3001';

// To:
const RAILWAY_API_URL = 'https://your-app.railway.app';
```

### Step 9: Test!

1. Open `test-mvp-upload.html`
2. Upload your video
3. It will process on Railway (with FFmpeg)
4. Preview with subtitles!

---

## 🎉 Benefits of Deploying Now

- ✅ FFmpeg already installed (no Windows setup)
- ✅ Test from any device
- ✅ Share with others
- ✅ Production environment
- ✅ Auto-scaling
- ✅ HTTPS by default

---

## 💰 Cost

Railway Starter Plan: **$5/month**

Includes:
- 500GB bandwidth
- $5 usage credits
- Auto-scaling
- FFmpeg pre-installed

**Perfect for MVP testing!**

---

## 📞 Need Help?

If you prefer to install FFmpeg locally, see the main instructions.

Otherwise, deploying to Railway now is the fastest way to test!
