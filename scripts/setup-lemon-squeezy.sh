#!/usr/bin/env bash
# Configure Presusimple Lemon Squeezy billing using lsq-mini-cli + Lemon Squeezy API.
#
# Prerequisites:
#   - Lemon Squeezy API key from Dashboard → Settings → API
#   - At least one published subscription product + variant in your store
#   - lsq-mini-cli installed globally: npm install -g lsq-mini-cli
#
# Usage:
#   LEMONSQUEEZY_API_KEY=your_key ./scripts/setup-lemon-squeezy.sh
#   LEMONSQUEEZY_API_KEY=your_key ./scripts/setup-lemon-squeezy.sh --webhook-url https://www.presusimple.com/api/lemonsqueezy/webhook
#   LEMONSQUEEZY_API_KEY=your_key ./scripts/setup-lemon-squeezy.sh --variant-id 123456

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.local"
WEBHOOK_URL=""
VARIANT_ID=""
TEST_MODE="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --webhook-url)
      WEBHOOK_URL="$2"
      shift 2
      ;;
    --variant-id)
      VARIANT_ID="$2"
      shift 2
      ;;
    --test-mode)
      TEST_MODE="true"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [[ -z "${LEMONSQUEEZY_API_KEY:-}" ]]; then
  echo "Error: LEMONSQUEEZY_API_KEY is required."
  echo "Create one at Lemon Squeezy Dashboard → Settings → API"
  exit 1
fi

if ! command -v lsq >/dev/null 2>&1; then
  echo "Installing lsq-mini-cli globally..."
  npm install -g lsq-mini-cli
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install with: brew install jq"
  exit 1
fi

APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
if [[ -f "$ENV_FILE" ]]; then
  EXISTING_APP_URL="$(grep -E '^NEXT_PUBLIC_APP_URL=' "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"' || true)"
  if [[ -n "$EXISTING_APP_URL" ]]; then
    APP_URL="$EXISTING_APP_URL"
  fi
fi

if [[ -z "$WEBHOOK_URL" ]]; then
  WEBHOOK_URL="${APP_URL%/}/api/lemonsqueezy/webhook"
fi

echo "==> Configuring lsq CLI..."
lsq config set --api-key "$LEMONSQUEEZY_API_KEY" >/dev/null

echo "==> Listing stores..."
lsq stores:list

STORE_ID="$(curl -s \
  -H "Accept: application/vnd.api+json" \
  -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
  "https://api.lemonsqueezy.com/v1/stores" | jq -r '.data[0].id // empty')"

if [[ -z "$STORE_ID" ]]; then
  echo "Error: No Lemon Squeezy store found on this account."
  exit 1
fi

lsq config set --api-key "$LEMONSQUEEZY_API_KEY" --store "$STORE_ID" >/dev/null
echo "Using store ID: $STORE_ID"

echo "==> Listing products..."
lsq products:list --store "$STORE_ID"

if [[ -z "$VARIANT_ID" ]]; then
  echo "==> Finding subscription variants..."
  PRODUCT_ID="$(curl -s \
    -H "Accept: application/vnd.api+json" \
    -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
    "https://api.lemonsqueezy.com/v1/products?filter%5Bstore_id%5D=${STORE_ID}&page%5Bsize%5D=100" | jq -r '.data[0].id // empty')"

  if [[ -z "$PRODUCT_ID" || "$PRODUCT_ID" == "null" ]]; then
    echo "Error: No products found for store ${STORE_ID}."
    echo "Create a subscription product in the Lemon Squeezy dashboard first."
    exit 1
  fi

  VARIANTS_JSON="$(curl -s \
    -H "Accept: application/vnd.api+json" \
    -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
    "https://api.lemonsqueezy.com/v1/variants?filter%5Bproduct_id%5D=${PRODUCT_ID}&page%5Bsize%5D=100")"

  VARIANT_ID="$(echo "$VARIANTS_JSON" | jq -r '
    [.data[] | select(.attributes.status == "published") |
      select(.attributes.is_subscription == true or (.attributes.interval != null))] |
    if length == 0 then
      [.data[] | select(.attributes.status == "published")][0].id // empty
    else
      .[0].id
    end
  ')"

  if [[ -z "$VARIANT_ID" || "$VARIANT_ID" == "null" ]]; then
    echo "Error: No published variant found."
    echo "Create a subscription product in the Lemon Squeezy dashboard first."
    exit 1
  fi
fi

VARIANT_JSON="$(curl -s \
  -H "Accept: application/vnd.api+json" \
  -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
  "https://api.lemonsqueezy.com/v1/variants/${VARIANT_ID}")"

VARIANT_NAME="$(echo "$VARIANT_JSON" | jq -r '.data.attributes.name // "Unknown"')"
PRODUCT_ID="$(echo "$VARIANT_JSON" | jq -r '.data.relationships.product.data.id // empty')"

echo "Using variant ID: $VARIANT_ID ($VARIANT_NAME)"
if [[ -n "$PRODUCT_ID" ]]; then
  lsq variants:list --product "$PRODUCT_ID" 2>/dev/null || true
fi

WEBHOOK_SECRET="$(openssl rand -hex 20)"
WEBHOOK_EVENTS='[
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
  "subscription_resumed",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_success",
  "subscription_payment_failed",
  "subscription_payment_recovered",
  "order_refunded",
  "subscription_payment_refunded"
]'

echo "==> Checking existing webhooks..."
EXISTING_WEBHOOK="$(curl -s \
  -H "Accept: application/vnd.api+json" \
  -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
  "https://api.lemonsqueezy.com/v1/webhooks?filter%5Bstore_id%5D=${STORE_ID}" | jq -r --arg url "$WEBHOOK_URL" '.data[]? | select(.attributes.url == $url) | .id' | head -1)"

if [[ -n "$EXISTING_WEBHOOK" ]]; then
  echo "Webhook already exists for ${WEBHOOK_URL} (id: ${EXISTING_WEBHOOK})"
  echo "Keeping existing webhook. Set LEMONSQUEEZY_WEBHOOK_SECRET to the secret you used when creating it."
else
  echo "==> Creating webhook for ${WEBHOOK_URL}..."
  CREATE_PAYLOAD="$(jq -n \
    --arg url "$WEBHOOK_URL" \
    --arg secret "$WEBHOOK_SECRET" \
    --argjson events "$WEBHOOK_EVENTS" \
    --arg store "$STORE_ID" \
    --argjson test_mode "$TEST_MODE" \
    '{
      data: {
        type: "webhooks",
        attributes: {
          url: $url,
          events: $events,
          secret: $secret,
          test_mode: $test_mode
        },
        relationships: {
          store: {
            data: { type: "stores", id: $store }
          }
        }
      }
    }')"

  WEBHOOK_RESPONSE="$(curl -s \
    -X POST "https://api.lemonsqueezy.com/v1/webhooks" \
    -H "Accept: application/vnd.api+json" \
    -H "Content-Type: application/vnd.api+json" \
    -H "Authorization: Bearer ${LEMONSQUEEZY_API_KEY}" \
    -d "$CREATE_PAYLOAD")"

  WEBHOOK_ID="$(echo "$WEBHOOK_RESPONSE" | jq -r '.data.id // empty')"
  if [[ -z "$WEBHOOK_ID" ]]; then
    echo "Failed to create webhook:"
    echo "$WEBHOOK_RESPONSE" | jq .
    exit 1
  fi

  echo "Created webhook ID: $WEBHOOK_ID"
  lsq webhooks:list --store "$STORE_ID" || true
fi

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
      sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    fi
  else
    printf '\n# Lemon Squeezy Configuration\n' >> "$ENV_FILE"
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

touch "$ENV_FILE"

upsert_env "LEMONSQUEEZY_API_KEY" "$LEMONSQUEEZY_API_KEY"
upsert_env "LEMONSQUEEZY_STORE_ID" "$STORE_ID"
upsert_env "LEMONSQUEEZY_VARIANT_ID" "$VARIANT_ID"

if [[ -n "$EXISTING_WEBHOOK" ]]; then
  if ! grep -q "^LEMONSQUEEZY_WEBHOOK_SECRET=" "$ENV_FILE" 2>/dev/null; then
    echo ""
    echo "NOTE: Add LEMONSQUEEZY_WEBHOOK_SECRET manually (existing webhook secret from dashboard)."
  fi
else
  upsert_env "LEMONSQUEEZY_WEBHOOK_SECRET" "$WEBHOOK_SECRET"
fi

echo ""
echo "==> Done. Updated ${ENV_FILE} with:"
echo "  LEMONSQUEEZY_STORE_ID=${STORE_ID}"
echo "  LEMONSQUEEZY_VARIANT_ID=${VARIANT_ID}"
echo "  LEMONSQUEEZY_WEBHOOK_URL=${WEBHOOK_URL}"
if [[ -z "$EXISTING_WEBHOOK" ]]; then
  echo "  LEMONSQUEEZY_WEBHOOK_SECRET=${WEBHOOK_SECRET}"
fi
echo ""
echo "Restart your dev server, then test checkout from /budget/settings."
echo "For local webhook testing, use a tunnel (ngrok/cloudflare) pointing to /api/lemonsqueezy/webhook."
