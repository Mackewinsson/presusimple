# GSC credentials (gitignored JSON)

The **reference** lives in `.env.local`:

```bash
GSC_CREDENTIALS_PATH=./secrets/gsc-service-account.json
GSC_SITE_URL=sc-domain:presusimple.com
```

The actual service account file stays here (never committed):

```
secrets/gsc-service-account.json
```

## Setup

```bash
npm run setup:gsc
```

This copies your JSON from Downloads and adds `GSC_CREDENTIALS_PATH` to `.env.local` if missing.

## Why not the full JSON inside .env?

Google service accounts need `client_email`, `private_key`, and more. A path in `.env.local` is cleaner than a multi-line secret. For CI/serverless you can use `GSC_SERVICE_ACCOUNT_JSON` as a single-line JSON string instead.

Add the service account email as a user in [Google Search Console](https://search.google.com/search-console).
