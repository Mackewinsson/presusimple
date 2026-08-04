#!/usr/bin/env node
/**
 * Fetch Google Search Console performance data (last 30–60 days).
 * Authenticates via GSC_CREDENTIALS_JSON env var (service account JSON).
 *
 * Usage:
 *   GSC_CREDENTIALS_JSON='{"type":"service_account",...}' \
 *   GSC_SITE_URL='sc-domain:presusimple.com' \
 *   node scripts/fetch-gsc-data.mjs
 */

import { google } from "googleapis";
import fs from "fs";
import path from "path";

const CREDENTIALS_ENV = "GSC_CREDENTIALS_JSON";
const SITE_URL_ENV = "GSC_SITE_URL";
const DEFAULT_SITE_URL = "sc-domain:presusimple.com";
const OUTPUT_PATH = path.join(process.cwd(), "scripts/seo-gsc-data.json");

function getDateRange(daysBack = 45) {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC data lag
  const start = new Date(end);
  start.setDate(start.getDate() - daysBack);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function main() {
  const raw = process.env[CREDENTIALS_ENV];
  if (!raw) {
    console.error(
      `Missing ${CREDENTIALS_ENV}. Set the service account JSON in your environment.`
    );
    process.exit(1);
  }

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to parse ${CREDENTIALS_ENV}:`, err.message);
    process.exit(1);
  }

  const siteUrl = process.env[SITE_URL_ENV] || DEFAULT_SITE_URL;
  const { startDate, endDate } = getDateRange(45);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const searchconsole = google.searchconsole({ version: "v1", auth });

  console.log(`Querying GSC for ${siteUrl} (${startDate} → ${endDate})...`);

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page", "query"],
      rowLimit: 25000,
    },
  });

  const rows = (response.data.rows || []).map((row) => ({
    url: row.keys?.[0] ?? "",
    query: row.keys?.[1] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));

  const output = {
    fetchedAt: new Date().toISOString(),
    siteUrl,
    dateRange: { startDate, endDate },
    rowCount: rows.length,
    rows,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Wrote ${rows.length} rows to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("GSC fetch failed:", err.message);
  process.exit(1);
});
