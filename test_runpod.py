import base64
import requests
import time
import sys
import json

API_KEY = "rpa_0CEN138JZOX3GFD7DUKYW96ZJVVP647YRLHLQRAN1ekr4z"
ENDPOINT_ID = "iw97yrnfsg28si"
AUDIO_FILE = "videoplayback-[AudioTrimmer.com].mp3"
OUTPUT_SRT = "output.srt"
OUTPUT_WORDS_JSON = "output_words.json"  # Word-level for video editors
# =========================

RUN_URL = f"https://api.runpod.ai/v2/{ENDPOINT_ID}/run"
STATUS_URL = f"https://api.runpod.ai/v2/{ENDPOINT_ID}/status/"


def format_timestamp(seconds):
    """Convert seconds to SRT timestamp format: HH:MM:SS,mmm"""
    if seconds is None:
        seconds = 0.0
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def segments_to_srt(segments):
    """Convert segments with timestamps to SRT format."""
    srt_lines = []
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg["start"])
        end = format_timestamp(seg["end"])
        text = seg["text"]
        srt_lines.append(f"{i}\n{start} --> {end}\n{text}\n")
    return "\n".join(srt_lines)


def load_audio_as_base64(path):
    try:    
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    except Exception as e:
        print(f"❌ Error reading audio file: {e}")
        sys.exit(1)


def submit_job(audio_b64):
    payload = {"input": {"audio": audio_b64}}
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(RUN_URL, json=payload, headers=headers)
        data = res.json()
        print("➡️ Job submitted:", data)
        return data.get("id")
    except Exception as e:
        print(f"❌ API Error: {e}")
        sys.exit(1)


def wait_for_result(job_id):
    headers = {"Authorization": f"Bearer {API_KEY}"}

    print("\n⏳ Waiting for transcription...\n")

    while True:
        res = requests.get(STATUS_URL + job_id, headers=headers)
        data = res.json()

        status = data.get("status")

        print(f"Status: {status}")

        if status == "COMPLETED":
            output = data["output"]
            
            print("\n===== FULL TRANSCRIPTION =====\n")
            print(output.get("text", ""))
            print("\n===============================\n")
            
            # Check if segments with timestamps are available
            segments = output.get("segments", [])
            words = output.get("words", [])
            
            if segments:
                srt_content = segments_to_srt(segments)
                
                print("===== SRT OUTPUT (2-3 words per line) =====\n")
                print(srt_content[:1000] + "..." if len(srt_content) > 1000 else srt_content)
                print("\n============================================\n")
                
                # Save SRT file
                with open(OUTPUT_SRT, "w", encoding="utf-8") as f:
                    f.write(srt_content)
                print(f"✅ SRT saved to: {OUTPUT_SRT}")
            
            if words:
                # Save word-level JSON for video editors (viral reels style)
                with open(OUTPUT_WORDS_JSON, "w", encoding="utf-8") as f:
                    json.dump(words, f, indent=2, ensure_ascii=False)
                print(f"✅ Word-level JSON saved to: {OUTPUT_WORDS_JSON}")
                print(f"   ({len(words)} words with individual timestamps)")
            
            if not segments and not words:
                print("⚠️ No timestamp data returned (older handler version?)")
            
            return output

        if status == "FAILED":
            print("❌ Job failed:", data)
            sys.exit(1)

        time.sleep(2)


def main():
    print(f"🎵 Loading audio file: {AUDIO_FILE}")
    audio_b64 = load_audio_as_base64(AUDIO_FILE)

    print("🚀 Submitting job to RunPod...")
    job_id = submit_job(audio_b64)

    if not job_id:
        print("❌ No job ID returned! Something went wrong.")
        sys.exit(1)

    wait_for_result(job_id)


if __name__ == "__main__":
    main()