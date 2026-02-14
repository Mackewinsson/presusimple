#!/bin/bash
# Generate icon files from source logo (SP (3).png)
# Run from project root: ./scripts/generate-icons.sh

set -e
ICONS_DIR="public/icons"
SOURCE="$ICONS_DIR/SP (3).png"

if [ ! -f "$SOURCE" ]; then
  echo "Source image not found: $SOURCE"
  exit 1
fi

SIZES="16 32 48 72 96 128 144 152 180 192 256 384 512"

for SIZE in $SIZES; do
  OUTPUT="$ICONS_DIR/icon-${SIZE}x${SIZE}.png"
  echo "Generating $OUTPUT"
  sips -z $SIZE $SIZE "$SOURCE" --out "$OUTPUT"
done

echo "Done. Generated icons: $SIZES"
