/**
 * Google Search Console Data Fetcher (Node.js)
 *
 * Usage:
 *   node scripts/fetch-gsc.js <siteUrl> <startDate> <endDate> [dimensions...]
 *
 * Example:
 *   node scripts/fetch-gsc.js "sc-domain:presusimple.com" "2026-06-01" "2026-06-30" query page
 *
 * Environment:
 *   GSC_CREDENTIALS_PATH  Path to service account JSON (default: secrets/gsc-service-account.json)
 *   GSC_SITE_URL          Optional default site URL
 */

const {
  DEFAULT_SITE_URL,
  getCredentialsSource,
  querySearchAnalytics,
} = require("./lib/gsc-client");

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error(
    "Usage: node scripts/fetch-gsc.js <siteUrl> <startDate> <endDate> [dimensions...]"
  );
  console.error(
    'Example: node scripts/fetch-gsc.js "sc-domain:presusimple.com" "2026-06-01" "2026-06-30" query page'
  );
  process.exit(1);
}

const siteUrl = args[0] || process.env.GSC_SITE_URL || DEFAULT_SITE_URL;
const startDate = args[1];
const endDate = args[2];
const dimensions = args.slice(3).length > 0 ? args.slice(3) : ["query"];

async function main() {
  try {
    console.error(
      `Fetching GSC data for ${siteUrl} (${startDate} to ${endDate}) with dimensions: ${dimensions.join(", ")}...`
    );
    console.error(`Using credentials: ${getCredentialsSource()}`);

    const data = await querySearchAnalytics({
      siteUrl,
      startDate,
      endDate,
      dimensions,
    });

    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`GSC Fetch Error: ${error.message}`);
    if (error.response?.data) {
      console.error(
        "API Response error details:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    process.exit(1);
  }
}

main();
