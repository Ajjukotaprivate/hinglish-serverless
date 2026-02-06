FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04

# Basic system updates
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    git-lfs \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Git LFS
RUN git lfs install

# Create workspace
WORKDIR /workspace

# Copy requirements FIRST (changes rarely)
COPY requirements.txt /workspace/requirements.txt

# Install Python dependencies (cached if requirements.txt unchanged)
RUN pip3 install --upgrade pip
RUN pip3 install -r /workspace/requirements.txt

# Clone the custom Whisper-Hindi2Hinglish model (HIGH-QUALITY Hinglish)
RUN git clone https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex

# Pre-download WhisperX alignment model for Hindi (faster cold starts)
RUN python3 -c "import whisperx; whisperx.load_align_model(language_code='hi', device='cpu')"

# Copy handler LAST (changes frequently)
COPY handler.py /workspace/handler.py

# Start RunPod Serverless handler
CMD ["python3", "/workspace/handler.py"]
