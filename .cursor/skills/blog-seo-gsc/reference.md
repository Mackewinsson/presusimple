# Blog SEO reference

## Issue codes

| Code | Meaning | Fix |
|------|---------|-----|
| `title_short` | Title under 30 chars | Add specificity + keyword |
| `title_long` | Title over 60 chars | Trim for SERP display |
| `description_short` | Meta under 120 chars | Expand with benefit + CTA |
| `description_long` | Meta over 160 chars | Trim trailing fluff |
| `thin_content` | Under ~900 words | Add sections, examples, FAQ |
| `few_headings` | Fewer than 3 H2s | Split into scannable sections |
| `few_internal_links` | Fewer than 2 blog links | Cross-link related posts |
| `missing_tags` | No frontmatter tags | Add 3-5 topical tags |
| `low_ctr` | 100+ impressions, CTR < 2% | Rewrite title/description for intent |
| `low_position` | 50+ impressions, pos > 15 | Deepen content around top queries |
| `no_gsc_data` | Zero impressions | Indexing + internal links |

## EN ↔ ES slug pairs

| EN | ES |
|----|-----|
| `how-to-stop-overspending` | `como-dejar-de-gastar-de-mas` |
| `emergency-fund-how-much-to-save` | `fondo-de-emergencia-cuanto-ahorrar` |
| `how-to-track-expenses-daily` | `como-controlar-gastos-diarios` |
| `50-30-20-vs-zero-based-budgeting` | `regla-50-30-20-vs-presupuesto-base-cero` |
| `getting-started-zero-based-budgeting` | `comenzar-presupuesto-base-cero` |
| `how-to-make-a-monthly-budget` | `como-hacer-un-presupuesto-mensual` |

When optimizing one locale, mirror structural improvements in the paired post.

## Canonical URLs

- EN: `https://www.presusimple.com/blog/{slug}`
- ES: `https://www.presusimple.com/es/blog/{slug}`

## GSC API notes

- Data lags ~3 days; audit uses end date = today − 3 days.
- Property must match GSC: `sc-domain:presusimple.com` or URL-prefix property.
- Service account needs Search Console user access (not just IAM).

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/blog-seo-audit.js` | Full blog audit (MDX + GSC) |
| `scripts/fetch-gsc.js` | Raw Search Analytics query |
| `scripts/setup-gsc-credentials.sh` | Install credentials to `secrets/` |
