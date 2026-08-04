#!/usr/bin/env node
/**
 * Blog SEO audit for Presusimple — combines MDX frontmatter/content checks
 * with Google Search Console performance data.
 *
 * Usage:
 *   node scripts/blog-seo-audit.js
 *   node scripts/blog-seo-audit.js --days 28 --locale en
 *   node scripts/blog-seo-audit.js --format markdown --output reports/blog-seo.md
 *
 * Environment (.env.local):
 *   GSC_CREDENTIALS_PATH       Path to service account JSON (recommended)
 *   GSC_SERVICE_ACCOUNT_JSON   Inline JSON string (alternative)
 *   GSC_SITE_URL               GSC property (default: sc-domain:presusimple.com)
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const {
  DEFAULT_APP_URL,
  DEFAULT_SITE_URL,
  getCredentialsSource,
  getDefaultDateRange,
  querySearchAnalytics,
} = require("./lib/gsc-client");

const CONTENT_DIR = path.join(__dirname, "..", "content", "blog");
const LOCALES = ["en", "es"];

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

function parseArgs(argv) {
  const options = {
    days: 28,
    locale: "all",
    format: "json",
    output: null,
    withQueries: true,
    minImpressions: 1,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--days") options.days = Number(argv[++i]);
    else if (arg === "--locale") options.locale = argv[++i];
    else if (arg === "--format") options.format = argv[++i];
    else if (arg === "--output") options.output = argv[++i];
    else if (arg === "--no-queries") options.withQueries = false;
    else if (arg === "--min-impressions") options.minImpressions = Number(argv[++i]);
    else if (arg === "--help" || arg === "-h") options.help = true;
  }

  return options;
}

function printHelp() {
  console.log(`Blog SEO audit

Usage:
  node scripts/blog-seo-audit.js [options]

Options:
  --days <n>              GSC lookback window (default: 28)
  --locale en|es|all      Audit one locale or both (default: all)
  --format json|markdown  Output format (default: json)
  --output <file>         Write report to file instead of stdout
  --no-queries            Skip per-page query breakdown (faster)
  --min-impressions <n>   Ignore GSC rows below this threshold (default: 1)

Environment:
  GSC_CREDENTIALS_PATH       Path to service account JSON in .env.local (recommended)
  GSC_SERVICE_ACCOUNT_JSON   Inline JSON string (alternative)
  GSC_SITE_URL               Search Console property URL
`);
}

function loadBlogPosts(locale) {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(raw);
      const basePath = locale === "es" ? "/es/blog" : "/blog";
      const url = `${DEFAULT_APP_URL}${basePath}/${slug}`;

      const h2Matches = content.match(/^##\s+/gm) || [];
      const internalLinks = (content.match(/\]\(\/blog\/[^)]+\)/g) || []).length;
      const words = content
        .replace(/[#>*`\[\]()!-]/g, " ")
        .split(/\s+/)
        .filter(Boolean).length;

      return {
        locale,
        slug,
        filePath,
        url,
        title: String(data.title ?? slug),
        description: String(data.description ?? ""),
        date: String(data.date ?? ""),
        author: String(data.author ?? "Presusimple"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        contentAudit: {
          wordCount: words,
          h2Count: h2Matches.length,
          internalLinks,
        },
      };
    });
}

function normalizePageUrl(page) {
  try {
    const parsed = new URL(page);
    parsed.hash = "";
    parsed.search = "";
    let normalized = parsed.toString();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    return normalized;
  } catch {
    return page;
  }
}

function aggregatePageMetrics(rows) {
  const byPage = new Map();

  for (const row of rows) {
    const page = normalizePageUrl(row.keys[0]);
    const current = byPage.get(page) || {
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      _positionWeight: 0,
      queries: [],
    };

    current.clicks += row.clicks || 0;
    current.impressions += row.impressions || 0;
    current._positionWeight += (row.position || 0) * (row.impressions || 0);

    if (row.keys[1]) {
      current.queries.push({
        query: row.keys[1],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      });
    }

    byPage.set(page, current);
  }

  for (const [page, metrics] of byPage.entries()) {
    metrics.ctr = metrics.impressions
      ? metrics.clicks / metrics.impressions
      : 0;
    metrics.position = metrics.impressions
      ? metrics._positionWeight / metrics.impressions
      : 0;
    metrics.queries.sort((a, b) => b.impressions - a.impressions);
    metrics.topQueries = metrics.queries.slice(0, 10);
    delete metrics._positionWeight;
    delete metrics.queries;
    byPage.set(page, metrics);
  }

  return byPage;
}

function auditPost(post, gscMetrics) {
  const issues = [];
  const recommendations = [];

  const titleLen = post.title.length;
  const descLen = post.description.length;

  if (titleLen < TITLE_MIN) {
    issues.push(`title_short:${titleLen}`);
    recommendations.push(
      `Expand title to ${TITLE_MIN}-${TITLE_MAX} chars (currently ${titleLen}). Lead with primary keyword.`
    );
  } else if (titleLen > TITLE_MAX) {
    issues.push(`title_long:${titleLen}`);
    recommendations.push(
      `Shorten title to ${TITLE_MAX} chars or less (currently ${titleLen}) to avoid truncation in SERPs.`
    );
  }

  if (descLen < DESC_MIN) {
    issues.push(`description_short:${descLen}`);
    recommendations.push(
      `Expand meta description to ${DESC_MIN}-${DESC_MAX} chars with a clear benefit + CTA.`
    );
  } else if (descLen > DESC_MAX) {
    issues.push(`description_long:${descLen}`);
    recommendations.push(
      `Trim meta description to ${DESC_MAX} chars (currently ${descLen}).`
    );
  }

  if (post.contentAudit.wordCount < 900) {
    issues.push(`thin_content:${post.contentAudit.wordCount}`);
    recommendations.push(
      "Add 300-600 words: examples, FAQs, or actionable steps to strengthen topical depth."
    );
  }

  if (post.contentAudit.h2Count < 3) {
    issues.push(`few_headings:${post.contentAudit.h2Count}`);
    recommendations.push(
      "Add more H2 sections targeting related subtopics and long-tail queries."
    );
  }

  if (post.contentAudit.internalLinks < 2) {
    issues.push(`few_internal_links:${post.contentAudit.internalLinks}`);
    recommendations.push(
      "Link to 2-3 related Presusimple blog posts and one product page (/budget)."
    );
  }

  if (!post.tags.length) {
    issues.push("missing_tags");
    recommendations.push("Add 3-5 tags in frontmatter for keyword clustering.");
  }

  const gsc = gscMetrics || {
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    topQueries: [],
  };

  if (gsc.impressions >= 100 && gsc.ctr < 0.02) {
    issues.push(`low_ctr:${(gsc.ctr * 100).toFixed(2)}%`);
    recommendations.push(
      "High impressions but low CTR — rewrite title/description to match search intent and add numbers or specificity."
    );
  }

  if (gsc.impressions >= 50 && gsc.position > 15) {
    issues.push(`low_position:${gsc.position.toFixed(1)}`);
    recommendations.push(
      "Ranking page 2+ — strengthen H2s around top queries, add internal links from higher-traffic posts."
    );
  }

  if (gsc.topQueries?.length) {
    const top = gsc.topQueries[0];
    if (top.impressions >= 20 && !post.title.toLowerCase().includes(top.query.split(" ")[0])) {
      recommendations.push(
        `Top query "${top.query}" (${top.impressions} impressions) — consider weaving it into title, first paragraph, or an H2.`
      );
    }
  }

  if (gsc.impressions === 0) {
    issues.push("no_gsc_data");
    recommendations.push(
      "No Search Console data yet — request indexing in GSC and add internal links from existing posts."
    );
  }

  return { issues, recommendations, gsc };
}

function toMarkdown(report) {
  const lines = [
    `# Blog SEO audit`,
    ``,
    `Generated: ${report.generatedAt}`,
    `Period: ${report.period.startDate} → ${report.period.endDate}`,
    `Property: ${report.siteUrl}`,
    ``,
    `## Summary`,
    `- Posts audited: ${report.summary.postsAudited}`,
    `- Posts with issues: ${report.summary.postsWithIssues}`,
    `- Total clicks: ${report.summary.totalClicks}`,
    `- Total impressions: ${report.summary.totalImpressions}`,
    ``,
  ];

  for (const post of report.posts) {
    lines.push(`## ${post.locale.toUpperCase()} / ${post.slug}`);
    lines.push(`URL: ${post.url}`);
    lines.push(`Title (${post.title.length}): ${post.title}`);
    lines.push(`Description (${post.description.length}): ${post.description}`);
    lines.push(
      `GSC: ${post.gsc.clicks} clicks, ${post.gsc.impressions} impressions, CTR ${(post.gsc.ctr * 100).toFixed(2)}%, pos ${post.gsc.position.toFixed(1)}`
    );

    if (post.gsc.topQueries?.length) {
      lines.push(`Top queries: ${post.gsc.topQueries.map((q) => q.query).join(", ")}`);
    }

    if (post.issues.length) {
      lines.push(`Issues: ${post.issues.join(", ")}`);
    }

    if (post.recommendations.length) {
      lines.push("Recommendations:");
      for (const rec of post.recommendations) {
        lines.push(`- ${rec}`);
      }
    }

    lines.push("");
  }

  if (report.orphanPages.length) {
    lines.push(`## Orphan GSC pages (traffic not mapped to MDX)`);
    for (const page of report.orphanPages) {
      lines.push(
        `- ${page.url}: ${page.clicks} clicks, ${page.impressions} impressions`
      );
    }
  }

  return lines.join("\n");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const credentialsPath = getCredentialsSource();
  const { startDate, endDate } = getDefaultDateRange(options.days);
  const siteUrl = process.env.GSC_SITE_URL || DEFAULT_SITE_URL;

  const locales =
    options.locale === "all" ? LOCALES : [options.locale].filter(Boolean);

  const posts = locales.flatMap((locale) => loadBlogPosts(locale));
  const postUrls = new Set(posts.map((post) => normalizePageUrl(post.url)));

  console.error(
    `Auditing ${posts.length} posts | GSC ${startDate} → ${endDate} | creds: ${credentialsPath}`
  );

  const dimensions = options.withQueries ? ["page", "query"] : ["page"];
  const gscData = await querySearchAnalytics({
    siteUrl,
    startDate,
    endDate,
    dimensions,
  });

  const rows = (gscData.rows || []).filter(
    (row) => row.impressions >= options.minImpressions
  );

  const blogRows = rows.filter((row) => {
    const page = normalizePageUrl(row.keys[0]);
    return page.includes("/blog/");
  });

  const pageMetrics = aggregatePageMetrics(blogRows);

  const auditedPosts = posts.map((post) => {
    const metrics = pageMetrics.get(normalizePageUrl(post.url));
    const { issues, recommendations, gsc } = auditPost(post, metrics);
    return {
      ...post,
      issues,
      recommendations,
      gsc,
      priorityScore:
        (gsc.impressions || 0) * 0.5 +
        issues.length * 10 +
        (gsc.impressions >= 100 && gsc.ctr < 0.02 ? 25 : 0),
    };
  });

  auditedPosts.sort((a, b) => b.priorityScore - a.priorityScore);

  const orphanPages = [...pageMetrics.entries()]
    .filter(([url]) => !postUrls.has(url))
    .map(([url, metrics]) => ({ url, ...metrics }))
    .sort((a, b) => b.impressions - a.impressions);

  const report = {
    generatedAt: new Date().toISOString(),
    period: { startDate, endDate, days: options.days },
    siteUrl,
    credentialsPath,
    posts: auditedPosts,
    orphanPages: orphanPages.slice(0, 20),
    summary: {
      postsAudited: auditedPosts.length,
      postsWithIssues: auditedPosts.filter((post) => post.issues.length).length,
      totalClicks: auditedPosts.reduce((sum, post) => sum + post.gsc.clicks, 0),
      totalImpressions: auditedPosts.reduce(
        (sum, post) => sum + post.gsc.impressions,
        0
      ),
    },
  };

  const output =
    options.format === "markdown" ? toMarkdown(report) : JSON.stringify(report, null, 2);

  if (options.output) {
    const outPath = path.resolve(options.output);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, output, "utf8");
    console.error(`Wrote ${outPath}`);
  } else {
    console.log(output);
  }
}

main().catch((error) => {
  console.error(`Blog SEO audit failed: ${error.message}`);
  if (error.response?.data) {
    console.error(JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
