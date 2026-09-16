#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────────────────
# Upload PsiAtiva WhyUs Section Assets to Cloudflare R2
# ─────────────────────────────────────────────────────────────
# Target Bucket: psiativa-assets
# Path Prefix:   psiativa.com.br/sections/WhyUs.astro/
# Served via:    https://cdn.psiativa.com.br/psiativa.com.br/sections/WhyUs.astro/
# ─────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT_DIR="$ROOT_DIR/src/assets/renders/out"
NAME="psiativa"
BUCKET="psiativa-assets"
PREFIX="psiativa.com.br/sections/WhyUs.astro"

# Resolve wrangler
if   [ -n "${WRANGLER:-}" ]; then :
elif command -v wrangler >/dev/null 2>&1; then WRANGLER="wrangler"
elif command -v bunx     >/dev/null 2>&1; then WRANGLER="bunx wrangler"
elif command -v npx      >/dev/null 2>&1; then WRANGLER="npx wrangler"
else echo "No wrangler found."; exit 1; fi

echo "Using: $WRANGLER"
echo "Uploading to $BUCKET/$PREFIX/ ..."

for item in mp4:video/mp4 webm:video/webm webp:image/webp jpg:image/jpeg; do
  ext="${item%%:*}"
  mime="${item##*:}"
  src="$OUT_DIR/${NAME}.${ext}"
  key="$PREFIX/${NAME}.${ext}"

  if [ ! -f "$src" ]; then
    echo "ERROR: Missing $src"
    exit 1
  fi

  echo "Uploading ${NAME}.${ext} -> ${BUCKET}/${key} (${mime})..."
  $WRANGLER r2 object put "${BUCKET}/${key}" \
    --file "$src" \
    --content-type "$mime" \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
done

echo "=== Verifying CDN URLs ==="
for ext in mp4 webm webp jpg; do
  url="https://cdn.psiativa.com.br/${PREFIX}/${NAME}.${ext}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "GET $url -> HTTP $status"
done

echo "Upload and verification complete!"
