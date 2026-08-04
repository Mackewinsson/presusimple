const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { JWT } = require("google-auth-library");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env.local") });
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const DEFAULT_SITE_URL = "sc-domain:presusimple.com";
const DEFAULT_APP_URL = "https://www.presusimple.com";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const DEFAULT_CREDENTIALS_FILE = path.join(
  __dirname,
  "..",
  "..",
  "secrets",
  "gsc-service-account.json"
);

function resolveCredentialsPath() {
  if (process.env.GSC_CREDENTIALS_PATH) {
    return path.isAbsolute(process.env.GSC_CREDENTIALS_PATH)
      ? process.env.GSC_CREDENTIALS_PATH
      : path.join(process.cwd(), process.env.GSC_CREDENTIALS_PATH);
  }

  if (fs.existsSync(DEFAULT_CREDENTIALS_FILE)) {
    return DEFAULT_CREDENTIALS_FILE;
  }

  return null;
}

function loadCredentialsFromEnv() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "GSC_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Use a single-line JSON string or set GSC_CREDENTIALS_PATH instead."
    );
  }
}

function loadCredentials(credentialsPath) {
  const fromEnv = loadCredentialsFromEnv();
  if (fromEnv) {
    return fromEnv;
  }

  const resolvedPath = credentialsPath ?? resolveCredentialsPath();
  if (!resolvedPath) {
    throw new Error(
      "GSC credentials missing. Add GSC_CREDENTIALS_PATH to .env.local (recommended) or GSC_SERVICE_ACCOUNT_JSON. See env.example."
    );
  }

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `GSC credentials file not found at ${resolvedPath}. Run: npm run setup:gsc`
    );
  }

  return JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
}

function getCredentialsSource() {
  if (process.env.GSC_SERVICE_ACCOUNT_JSON?.trim()) {
    return "GSC_SERVICE_ACCOUNT_JSON (.env)";
  }

  const resolvedPath = resolveCredentialsPath();
  return resolvedPath ?? "not configured";
}

async function createSearchConsoleClient(credentialsPath) {
  const credentials = loadCredentials(credentialsPath);

  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [GSC_SCOPE],
  });

  return google.searchconsole({
    version: "v1",
    auth,
  });
}

async function querySearchAnalytics({
  siteUrl = process.env.GSC_SITE_URL || DEFAULT_SITE_URL,
  startDate,
  endDate,
  dimensions = ["query"],
  dimensionFilterGroups,
  rowLimit = 5000,
  credentialsPath,
}) {
  const searchconsole = await createSearchConsoleClient(credentialsPath);

  const requestBody = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
  };

  if (dimensionFilterGroups) {
    requestBody.dimensionFilterGroups = dimensionFilterGroups;
  }

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody,
  });

  return response.data;
}

function getDefaultDateRange(days = 28) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const format = (date) => date.toISOString().slice(0, 10);

  return {
    startDate: format(start),
    endDate: format(end),
  };
}

module.exports = {
  DEFAULT_APP_URL,
  DEFAULT_SITE_URL,
  createSearchConsoleClient,
  getCredentialsSource,
  getDefaultDateRange,
  loadCredentials,
  querySearchAnalytics,
  resolveCredentialsPath,
};
