#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Sanitize & Encode PsiAtiva WhyUs Section Video Assets
# ─────────────────────────────────────────────────────────────
# Produces:
#  - psiativa.mp4  (H.264 High L4.0, CRF 23, faststart, 48kHz AAC 128k)
#  - psiativa.webm (VP9 Profile 0, two-pass CRF 34, 48kHz Opus 128k)
#  - psiativa.webp (Settled poster frame at 0.5s, quality 82, preset picture)
#  - psiativa.jpg  (Settled poster frame at 0.5s, q:v 4 universal fallback)
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$ROOT_DIR/src/assets/psiativa.mp4"
OUT_DIR="$ROOT_DIR/src/assets/renders/out"
NAME="psiativa"
TAG="-color_primaries bt709 -color_trc bt709 -colorspace bt709"

mkdir -p "$OUT_DIR"

echo "=== 1. Extracting poster frame at 0.5s ==="
ffmpeg -y -ss 00:00:00.500 -i "$SRC" -vframes 1 "$OUT_DIR/${NAME}.poster-source.png"
ffmpeg -y -i "$OUT_DIR/${NAME}.poster-source.png" -c:v libwebp -quality 82 -preset picture "$OUT_DIR/${NAME}.webp"
ffmpeg -y -i "$OUT_DIR/${NAME}.poster-source.png" -q:v 4 "$OUT_DIR/${NAME}.jpg"

echo "=== 2. Creating lossless reference for SSIM verification ==="
ffmpeg -y -i "$SRC" -an -c:v libx264 -qp 0 -preset ultrafast "$OUT_DIR/${NAME}.lossless.mp4"

echo "=== 3. Encoding H.264 High L4.0 (+faststart, AAC 128k, clean metadata) ==="
ffmpeg -y -i "$SRC" \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -crf 23 -preset slow $TAG \
  -movflags +faststart \
  -c:a aac -b:a 128k -ar 48000 \
  -map_metadata -1 \
  "$OUT_DIR/${NAME}.mp4"

echo "=== 4. Encoding VP9 Profile 0, two-pass (Opus 128k, clean metadata) ==="
ffmpeg -y -i "$SRC" -an -c:v libvpx-vp9 -pix_fmt yuv420p -profile:v 0 \
  -crf 34 -b:v 0 -threads 8 -tile-columns 2 -row-mt 1 -deadline good -cpu-used 4 $TAG \
  -pass 1 -f null /dev/null

ffmpeg -y -i "$SRC" \
  -c:v libvpx-vp9 -pix_fmt yuv420p -profile:v 0 \
  -crf 34 -b:v 0 -threads 8 -tile-columns 2 -row-mt 1 -deadline good -cpu-used 2 $TAG \
  -c:a libopus -b:a 128k -ar 48000 \
  -map_metadata -1 \
  -pass 2 "$OUT_DIR/${NAME}.webm"

rm -f ffmpeg2pass-*.log

echo "=== 5. Measuring SSIM against lossless reference ==="
ffmpeg -i "$OUT_DIR/${NAME}.mp4" -i "$OUT_DIR/${NAME}.lossless.mp4" -filter_complex "ssim" -f null - 2>&1 | grep -i "SSIM" || true
ffmpeg -i "$OUT_DIR/${NAME}.webm" -i "$OUT_DIR/${NAME}.lossless.mp4" -filter_complex "ssim" -f null - 2>&1 | grep -i "SSIM" || true

rm -f "$OUT_DIR/${NAME}.lossless.mp4" "$OUT_DIR/${NAME}.poster-source.png"

echo "=== 6. Deliverables summary ==="
ls -lh "$OUT_DIR/${NAME}".{mp4,webm,webp,jpg}

echo "=== 7. Probing streams and metadata ==="
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,level,width,height "$OUT_DIR/${NAME}.mp4"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate "$OUT_DIR/${NAME}.mp4"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,level,width,height "$OUT_DIR/${NAME}.webm"
ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,channels,sample_rate "$OUT_DIR/${NAME}.webm"

echo "Encoding complete!"
