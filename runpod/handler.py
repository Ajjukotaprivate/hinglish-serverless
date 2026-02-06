import runpod
import whisperx
import librosa
import numpy as np
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import torch
import base64
import tempfile
import os

# Custom Whisper-Hindi2Hinglish model for HIGH-QUALITY Hinglish transcription
MODEL_PATH = "/workspace/Whisper-Hindi2Hinglish-Apex"
SAMPLE_RATE = 16000

print("Loading custom Whisper-Hindi2Hinglish model...")
processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH).to("cuda")

print("Loading WhisperX alignment model...")
# WhisperX alignment model for word-level timestamps
align_model, align_metadata = whisperx.load_align_model(
    language_code="hi",  # Hindi
    device="cuda"
)
print("Models loaded successfully!")


def transcribe_hinglish(audio_path):
    """
    Transcribe using custom Whisper-Hindi2Hinglish model.
    Returns high-quality Hinglish text.
    """
    audio, _ = librosa.load(audio_path, sr=SAMPLE_RATE)
    audio = audio.astype(np.float32)
    
    inputs = processor(
        audio,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt"
    ).input_features.to("cuda").to(torch.bfloat16)
    
    predicted_ids = model.generate(inputs)
    text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()
    
    return text, len(audio) / SAMPLE_RATE


def get_word_timestamps(audio_path, transcription, duration):
    """
    Use WhisperX forced alignment to get word-level timestamps.
    This aligns the transcription text to the audio.
    """
    # Load audio for whisperx
    audio = whisperx.load_audio(audio_path)
    
    # Create segments format that whisperx expects
    # We have one big segment with the full transcription
    segments = [{
        "start": 0.0,
        "end": duration,
        "text": transcription
    }]
    
    # Align to get word-level timestamps
    result = whisperx.align(
        segments,
        align_model,
        align_metadata,
        audio,
        device="cuda",
        return_char_alignments=False
    )
    
    # Extract words with timestamps
    words = []
    for segment in result.get("segments", []):
        for word_data in segment.get("words", []):
            word = word_data.get("word", "").strip()
            start = word_data.get("start")
            end = word_data.get("end")
            
            if word and start is not None and end is not None:
                words.append({
                    "start": round(start, 3),
                    "end": round(end, 3),
                    "text": word
                })
    
    return words


def group_words_for_srt(words, max_words=3):
    """
    Group words into small chunks (2-3 words) for viral reels SRT format.
    """
    subtitles = []
    
    for i in range(0, len(words), max_words):
        group = words[i:i + max_words]
        if group:
            subtitles.append({
                "start": group[0]["start"],
                "end": group[-1]["end"],
                "text": " ".join(w["text"] for w in group)
            })
    
    return subtitles


def transcribe_with_timestamps(audio_path):
    """
    HYBRID approach:
    1. Custom model for high-quality Hinglish transcription
    2. WhisperX for word-level timestamps
    """
    
    # Step 1: Get high-quality Hinglish transcription
    print("Step 1: Transcribing with custom Hinglish model...")
    transcription, duration = transcribe_hinglish(audio_path)
    
    # Step 2: Get word-level timestamps via forced alignment
    print("Step 2: Getting word-level timestamps via alignment...")
    words = get_word_timestamps(audio_path, transcription, duration)
    
    # Step 3: Group words for SRT (2-3 words per line for viral reels)
    subtitles = group_words_for_srt(words, max_words=3)
    
    return {
        "text": transcription,
        "words": words,  # Individual words for advanced editors
        "segments": subtitles  # Grouped (2-3 words) for SRT files
    }


def handler(event):
    audio_b64 = event["input"]["audio"]

    audio_bytes = base64.b64decode(audio_b64)

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        audio_path = tmp.name

    try:
        result = transcribe_with_timestamps(audio_path)
    finally:
        # Cleanup temp file
        if os.path.exists(audio_path):
            os.remove(audio_path)

    return result


runpod.serverless.start({"handler": handler})
