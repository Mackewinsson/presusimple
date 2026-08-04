---
name: blog-seo-gsc
description: >-
  Fetches Google Search Console data and audits Presusimple blog MDX posts for
  SEO issues and optimization opportunities. Use when optimizing blog articles,
  improving meta titles/descriptions, analyzing search performance, GSC data,
  or content/blog SEO work.
---

# Blog SEO with Google Search Console

Audit and optimize Presusimple blog posts using live GSC data + MDX frontmatter checks.

## Prerequisites

1. Service account JSON at `secrets/gsc-service-account.json` (gitignored).
2. Service account email added as a user in [Google Search Console](https://search.google.com/search-console) for `sc-domain:presusimple.com`.
3. `npm install` (includes `googleapis` dev dependency).

Setup credentials:

```bash
npm run setup:gsc
# or: bash scripts/setup-gsc-credentials.sh ~/Downloads/gen-lang-client-0500786286-15fc96889451.json
```

## Agent workflow

Copy this checklist and track progress:

```
SEO audit progress:
- [ ] Run audit script and save report
- [ ] Prioritize posts by priorityScore / impressions
- [ ] Apply frontmatter fixes (title 30-60, description 120-160)
- [ ] Apply content fixes (H2s, internal links, top queries)
- [ ] Re-run audit or verify in GSC after deploy
```

### Step 1 — Fetch audit report

```bash
npm run blog:seo-audit -- --format markdown --output reports/blog-seo.md
```

JSON (for parsing):

```bash
npm run blog:seo-audit > /tmp/blog-seo.json
```

Options:

| Flag | Purpose |
|------|---------|
| `--days 28` | GSC lookback (default 28) |
| `--locale en` | Audit EN only (`es` or `all`) |
| `--format markdown` | Human-readable report |
| `--no-queries` | Faster, page metrics only |

Low-level GSC query:

```bash
node scripts/fetch-gsc.js "sc-domain:presusimple.com" "2026-06-01" "2026-06-30" page query
```

### Step 2 — Prioritize

Sort by `priorityScore` in the JSON output. Focus first on posts with:

- High impressions + low CTR (`low_ctr`)
- Ranking 15+ with meaningful impressions (`low_position`)
- Thin content or weak meta (`title_*`, `description_*`)

### Step 3 — Optimize MDX

Blog files live in:

- `content/blog/en/{slug}.mdx`
- `content/blog/es/{slug}.mdx`

**Same slug** per topic in EN and ES. Frontmatter:

```yaml
title: "..."       # 30-60 chars, primary keyword early
description: "..." # 120-160 chars, benefit + CTA
date: "YYYY-MM-DD"
author: "Presusimple"
tags: ["...", "..."]
```

Content rules:

- 900+ words for competitive topics
- 3+ H2 sections; weave `gsc.topQueries` into headings where natural
- 2+ internal links to `/blog/...` and `/budget` where relevant
- Keep tone: practical, zero-based budgeting, Presusimple product context

Metadata is rendered via `lib/seo.ts` → `getBlogPostMetadata()`. Do not change URL patterns (`/blog/{slug}`, `/es/blog/{slug}`).

### Step 4 — Output for the user

After edits, summarize per post:

1. What GSC showed (clicks, impressions, top query)
2. What changed (title, description, new H2s, links)
3. Expected impact

## Report fields

Each post in JSON includes:

| Field | Meaning |
|-------|---------|
| `priorityScore` | Higher = fix first |
| `issues` | Machine tags (`low_ctr`, `title_long`, etc.) |
| `recommendations` | Actionable strings |
| `gsc.topQueries` | Queries to target in copy |
| `contentAudit` | wordCount, h2Count, internalLinks |

## Environment (.env.local)

| Variable | Purpose |
|----------|---------|
| `GSC_CREDENTIALS_PATH` | **Recommended.** Path to gitignored JSON, e.g. `./secrets/gsc-service-account.json` |
| `GSC_SERVICE_ACCOUNT_JSON` | Alternative: full JSON as one line (CI/serverless) |
| `GSC_SITE_URL` | `sc-domain:presusimple.com` |

Scripts load `.env.local` automatically via `dotenv`.

## Security

- **Never commit** `.env.local`, `secrets/*.json`, or paste private keys in chat/commits.
- `.env.local` holds the path; the JSON file holds the actual credentials.

## Additional resources

- Optimization checklist and issue codes: [reference.md](reference.md)
