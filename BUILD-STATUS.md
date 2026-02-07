# Build Status: What's Built vs What Needs to Be Built

**Product:** Viral Subtitle Editor / Hinglish Caption Generator  
**Target:** SubtitlesFast-style UI with Hinglish capabilities

---

## Summary

| Category | Built | Needs to Build |
|----------|-------|----------------|
| **Core pipeline** | ✅ Upload → transcribe → SRT | — |
| **User system** | ❌ | Login, credits, dashboard |
| **Project management** | ❌ | Create, save, settings |
| **Media panel** | ⚠️ Basic upload only | Library, tabs, drag-drop |
| **Timeline** | ❌ | Full timeline system |
| **Subtitle panel** | ⚠️ Preview only | Generation UI, editor |
| **Style panel** | ❌ | Fonts, colors, animations |
| **Text elements** | ❌ | Titles, lower thirds, etc. |
| **Auto-edit** | ❌ | Silence, filler, smart cut |
| **Audio panel** | ❌ | Tracks, volume, fade |
| **Canvas** | ⚠️ Basic preview | Drag, resize, snap |
| **Storage** | ⚠️ Partial | Projects, exports |
| **Export** | ⚠️ SRT only | MP4 burn, settings |
| **Notifications** | ❌ | In-app, email |
| **Admin** | ❌ | Users, analytics, billing |
| **Monetization** | ❌ | Tiers, Stripe, affiliates |
| **Performance** | ⚠️ Basic | Warm GPU, cache, CDN |

---

## 1. USER ACCOUNT SYSTEM — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 1.1 Login / Signup | ❌ | Email OTP, Google — not implemented |
| 1.2 Credits System | ❌ | Buy credits, balance, history — not implemented |
| 1.3 User Dashboard | ❌ | Past projects, storage, delete — not implemented |

**Current:** Anonymous upload only; `userId` is optional string passed in request body.

---

## 2. PROJECT MANAGEMENT — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 2.1 Create New Project | ❌ | Name, aspect ratio, blank workspace |
| 2.2 Auto Save | ❌ | Every 2 seconds |
| 2.3 Manual Save | ❌ | Save button |
| 2.4 Project Settings | ❌ | Rename, aspect ratio, safe margins |

**Current:** No project concept; each upload is one-off, no persistence of project state.

---

## 3. MEDIA PANEL (Left Sidebar) — ⚠️ Partial

| Feature | Status | Notes |
|---------|--------|-------|
| 3.1 Upload Media | ✅ Partial | Supports MP4, MOV (via `video/*`); **50MB max** (spec: 350MB) |
| 3.2 Media Library Tabs | ❌ | Videos, Audio, Images — not implemented |
| 3.3 Drag & Drop | ❌ | Drag video to timeline — no timeline |
| 3.4 Video Preview | ❌ | Hover thumbnails — not implemented |

**Current:** Simple file input in `test-mvp-upload.html`; uploads to Railway → Supabase. No sidebar, no library.

---

## 4. TIMELINE SYSTEM — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 4.1 Video Track | ❌ | Thumbnails, waveform, zoom, scroll, trim, split |
| 4.2 Subtitle Track | ❌ | Boxes, drag, trim, double-click edit |
| 4.3 Additional Tracks | ❌ | Audio, images, text overlays |

**Current:** No timeline UI. Preview plays video with subtitle overlay only.

---

## 5. SUBTITLE GENERATION PANEL — ⚠️ Partial (Backend Done)

| Feature | Status | Notes |
|---------|--------|-------|
| 5.1 Language Selection | ❌ | Hinglish/Hindi/English — hardcoded Hinglish |
| 5.2 Start Transcription | ✅ Backend | Railway → RunPod pipeline works |
| 5.3 Status Feedback | ⚠️ Basic | Progress bar on upload; no "Extracting… Sending… Processing…" |
| 5.4 Costing | ❌ | No credit deduction |

**Current:** `POST /process-video` does full pipeline. No dedicated panel; upload triggers transcription. No language choice in UI.

---

## 6. SUBTITLE EDITOR (Right Sidebar) — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 6.1 Subtitle List | ❌ | Start/end/text, edit, merge, split, delete, add |
| 6.2 Search & Replace | ❌ | Find/replace text |
| 6.3 Lock Subtitle Track | ❌ | Avoid accidental move |

**Current:** No editor. Segments come from RunPod; no in-app editing.

---

## 7. SUBTITLE STYLE PANEL — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 7.1 Font Controls | ❌ | Family, size, line height, letter spacing, weight |
| 7.2 Text Alignment | ❌ | Left/Center/Right |
| 7.3 Text Color | ❌ | Color picker |
| 7.4 Outline (Stroke) | ❌ | Toggle, color, thickness |
| 7.5 Background Block | ❌ | Rounded rect, color, opacity, padding |
| 7.6 Word Highlighting | ❌ | Yellow/blue/red keywords |
| 7.7 Animation Effects | ❌ | Pop, bounce, slide, fade |

**Current:** Preview uses fixed style (white text, black background). No styling controls.

---

## 8. TEXT ELEMENTS PANEL — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 8.1 Large Title | ❌ | Intro text |
| 8.2 Lower Third | ❌ | Name + handle |
| 8.3 Watermark | ❌ | Logo/username |
| 8.4 Vlog Counter | ❌ | Day 1, Day 2 |
| 8.5 Revenue Counter | ❌ | Animated numbers |

**Current:** None. Only subtitle overlay from transcription.

---

## 9. AUTO-EDIT PANEL — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 9.1 Silence Detection | ❌ | Remove silent parts |
| 9.2 Remove Filler Words | ❌ | "Uh", "um", "like" |
| 9.3 Smart Cut | ❌ | Jump cuts |
| 9.4 Auto Zoom | ❌ | Zoom to speaker face |

**Current:** None.

---

## 10. AUDIO PANEL — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 10.1 Audio Tracks List | ❌ | Main video, music |
| 10.2 Volume Control | ❌ | Slider |
| 10.3 Fade In/Out | ❌ | Controls |
| 10.4 Noise Reduction | ❌ | Optional |

**Current:** Video plays with original audio; no separate audio controls.

---

## 11. CANVAS (Main Video Preview) — ⚠️ Partial

| Feature | Status | Notes |
|---------|--------|-------|
| 11.1 Drag elements | ❌ | Reposition subtitles |
| 11.2 Resize text | ❌ | Bounding box, handles |
| 11.3 Video preview | ✅ | Play in sync with subtitles |
| 11.4 Snap-to-center guides | ❌ | Not implemented |

**Current:** `test-mvp-preview.html` — video + subtitle overlay, synced. No canvas, no drag/resize.

---

## 12. STORAGE SYSTEM (Supabase) — ⚠️ Partial

| Feature | Status | Notes |
|---------|--------|-------|
| 12.1 Store Videos | ❌ | Original uploads — not stored in Supabase |
| 12.2 Store Audio | ✅ | `audio/{userId}/audio/{timestamp}-audio.wav` |
| 12.3 Store Subtitles JSON | ⚠️ | SRT/VTT stored; `segments.json` not stored |
| 12.4 Store Project Data | ❌ | Canvas, layout, fonts — no project DB |
| 12.5 Exported Files | ❌ | Burned MP4, SRT — SRT returned in response, not stored as export |

**Current:** Audio + SRT/VTT + words JSON uploaded. Video sent to Railway but not stored in Supabase. No projects table.

---

## 13. EXPORT SYSTEM — ⚠️ Partial

| Feature | Status | Notes |
|---------|--------|-------|
| 13.1 Export Formats | ⚠️ | SRT returned in API response; no MP4 burn, VTT, JSON export |
| 13.2 Export Settings | ❌ | Resolution, bitrate, FPS |
| 13.3 FFmpeg + Railway | ❌ | Burn subtitles into video — not implemented |
| 13.4 Progress Feedback | ❌ | Queued, rendering, ready |

**Current:** API returns SRT/VTT URLs. No video export with burned subtitles.

---

## 14. NOTIFICATIONS — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| In-app | ❌ | Transcription ready, export complete, credits low |
| Email | ❌ | Export ready, free credits |

**Current:** None.

---

## 15. ADMIN PANEL — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 15.1 User Management | ❌ | View users, projects, reset credits |
| 15.2 Usage Analytics | ❌ | Transcriptions, models, revenue |
| 15.3 Billing Dashboard | ❌ | Stripe integration |

**Current:** None.

---

## 16. MONETIZATION SYSTEM — ❌ Not Built

| Feature | Status | Notes |
|---------|--------|-------|
| 16.1 Free Tier | ❌ | 1 transcription/week, watermark |
| 16.2 Pay-Per-Use | ❌ | ₹10–₹49 per video |
| 16.3 Subscription | ❌ | Monthly credits, unlimited exports |
| 16.4 Affiliate Program | ❌ | Referral credits |

**Current:** No paywall, no credits.

---

## 17. PERFORMANCE OPTIMIZATION — ⚠️ Partial

| Feature | Status | Notes |
|---------|--------|-------|
| 17.1 Warm GPU | ⚠️ | Dummy request — design known, not implemented |
| 17.2 Cache transcriptions | ❌ | Same audio → instant return |
| 17.3 CDN for video | ❌ | Supabase + Edge CDN |

**Current:** RunPod cold starts possible. No caching.

---

## 18. BACKEND ARCHITECTURE — ✅ Aligned

| Component | Status | Notes |
|-----------|--------|-------|
| Railway (FFmpeg) | ✅ | MP4 → WAV 16kHz; can add waveform, burn |
| RunPod | ✅ | WhisperX Hinglish; segments + words |
| Supabase | ⚠️ | Storage in use; Auth, Realtime, DB not yet |

**Current:** Railway + RunPod + Supabase Storage match spec. Need to add burn endpoint, waveform, Auth, DB.

---

## 19. DATA STRUCTURES — ⚠️ Partial

| Structure | Status | Notes |
|-----------|--------|-------|
| Project | ❌ | `projectId`, `userId`, `videoUrl`, `canvas`, `timeline` — not stored |
| Subtitle segment | ⚠️ | `{ start, end, text }` from RunPod; no `id`, `style` in app |

**Current:** RunPod returns `{ text, segments, words }`. No project or segment schema in DB.

---

## 20. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (current)
- ✅ Upload → transcribe → SRT
- ✅ Preview with sync
- ✅ Railway + RunPod + Supabase Storage

### Phase 2: Core Editor
1. Next.js app with layout (media panel, timeline, canvas, subtitle editor)
2. Timeline system (video track + subtitle track)
3. Subtitle editor (list, edit, merge, split)
4. Project management (create, save, load)
5. Supabase: projects table, auth

### Phase 3: Styling & Export
1. Subtitle style panel (fonts, colors, stroke, animations)
2. FFmpeg burn endpoint on Railway
3. Export MP4 with burned subtitles
4. SRT/VTT/JSON export UI

### Phase 4: User & Monetization
1. Auth (email OTP, Google)
2. Credits system + Stripe
3. User dashboard
4. Admin panel

### Phase 5: Advanced
1. Text elements (titles, lower thirds, watermark)
2. Auto-edit (silence, filler words)
3. Audio panel
4. Warm GPU, cache, CDN
