#!/usr/bin/env bash
# Install GSC service account JSON and wire it through .env.local
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_DIR="$ROOT_DIR/secrets"
TARGET="$SECRETS_DIR/gsc-service-account.json"
ENV_LOCAL="$ROOT_DIR/.env.local"

SOURCE="${1:-$HOME/Downloads/gen-lang-client-0500786286-15fc96889451.json}"

mkdir -p "$SECRETS_DIR"

if [[ ! -f "$SOURCE" ]]; then
  echo "Error: credentials file not found at: $SOURCE" >&2
  echo "Usage: bash scripts/setup-gsc-credentials.sh [path-to-service-account.json]" >&2
  exit 1
fi

cp "$SOURCE" "$TARGET"
chmod 600 "$TARGET"

REL_PATH="./secrets/gsc-service-account.json"
ENV_LINE="GSC_CREDENTIALS_PATH=$REL_PATH"

touch "$ENV_LOCAL"

if grep -q "^GSC_CREDENTIALS_PATH=" "$ENV_LOCAL"; then
  echo "ℹ️  GSC_CREDENTIALS_PATH already set in .env.local"
else
  printf "\n# Google Search Console (blog SEO scripts)\n%s\n" "$ENV_LINE" >> "$ENV_LOCAL"
  echo "✅ Added GSC_CREDENTIALS_PATH to .env.local"
fi

if ! grep -q "^GSC_SITE_URL=" "$ENV_LOCAL"; then
  echo "GSC_SITE_URL=sc-domain:presusimple.com" >> "$ENV_LOCAL"
  echo "✅ Added GSC_SITE_URL to .env.local"
fi

echo "✅ GSC credentials installed at secrets/gsc-service-account.json"
echo "   Service account: $(node -pe "JSON.parse(require('fs').readFileSync('$TARGET','utf8')).client_email")"
echo ""
echo "Next: add that email as a user in Google Search Console, then run:"
echo "  npm run blog:seo-audit"
