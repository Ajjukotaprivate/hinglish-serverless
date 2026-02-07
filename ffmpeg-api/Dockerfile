# FFmpeg API for Hinglish subtitle generation
# Includes FFmpeg for audio extraction from video

FROM node:20-slim

# Install FFmpeg + fontconfig for ASS subtitle burn (fonts, outline, libass)
RUN apt-get update && apt-get install -y ffmpeg fontconfig fonts-liberation && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Start the API
CMD ["node", "index-complete.js"]
