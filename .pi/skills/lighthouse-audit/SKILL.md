---
name: lighthouse-audit
description: Run a Google Lighthouse audit against the site and report actionable findings. Use when the user wants to check performance, accessibility, SEO, or best practices. Works against both the local dev server and the production URL.
---

# Lighthouse Audit

Run Lighthouse and present actionable results. Follow these steps in order.

## Step 1: Determine Target

Decide what to audit:

- If the user specified a URL, use that.
- If the user said "production" or "live", use `https://bojan.delic.rs/`.
- If the user said "local" or "dev", use `http://localhost:1313/`. Check the dev server is running first:
  ```bash
  pgrep -f 'hugo server' && echo "Running" || echo "Not running"
  ```
  If not running, tell the user to start it (or offer to start it using the hugo-dev skill).
- If the user didn't specify, ask whether to audit production or local.

Default to auditing the homepage. If the user asked about a specific page (e.g., "check my blog page"), map it to the correct URL path.

## Step 2: Run Lighthouse

Run Lighthouse in headless Chrome mode, outputting JSON for parsing:

```bash
npx lighthouse "<URL>" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json \
  --output-path=/tmp/lighthouse-report.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet
```

**Timeout**: Use a 60-second timeout. Lighthouse can hang on unreachable URLs.

If Lighthouse fails, check:
- Is the URL reachable? (`curl -sI <URL>`)
- Is Chrome installed? (`which google-chrome || which chromium`)
- Show the error output to the user.

Also generate an HTML report for the user to open in a browser:

```bash
npx lighthouse "<URL>" \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=html \
  --output-path=/tmp/lighthouse-report.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --quiet
```

## Step 3: Parse Results

Read the JSON report and extract:

```bash
cat /tmp/lighthouse-report.json | node -e "
const r = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const cats = r.categories;
console.log('## Scores');
for (const [k,v] of Object.entries(cats)) {
  console.log(k + ': ' + Math.round(v.score * 100));
}
console.log();
console.log('## Failed Audits');
for (const [id, audit] of Object.entries(r.audits)) {
  if (audit.score !== null && audit.score < 1 && audit.details) {
    console.log('- ' + audit.title + ' (score: ' + Math.round(audit.score * 100) + ')');
    if (audit.description) console.log('  ' + audit.description.split('[')[0].trim());
  }
}
"
```

## Step 4: Present Report

Structure the report as:

```
## Lighthouse Audit: <URL>

### Scores
| Category        | Score |
|-----------------|-------|
| Performance     | XX    |
| Accessibility   | XX    |
| Best Practices  | XX    |
| SEO             | XX    |

### Issues to Fix

Group by category. For each failed audit:
- **What**: Name of the audit
- **Why it matters**: One sentence
- **How to fix**: Concrete action for this specific site (reference actual files/templates)

### What's Good
Briefly note any perfect (100) scores or notable passes.
```

### Prioritization

Order issues by impact:
1. **Accessibility** failures — these affect real users
2. **Performance** — largest contentful paint, CLS, blocking resources
3. **SEO** — missing meta, crawlability issues
4. **Best Practices** — usually minor

### Be Specific

Don't just repeat Lighthouse's generic advice. Map findings to this project:
- CSS issue → `themes/minimal/assets/css/<file>.css`
- Meta tag issue → `themes/minimal/layouts/partials/head.html`
- Image issue → `static/` or the specific post bundle
- Header issue → `static/_headers`

### HTML Report

Tell the user they can open the full interactive report:

```
Full HTML report saved to /tmp/lighthouse-report.html
Open it with: open /tmp/lighthouse-report.html
```

## Notes

- Lighthouse scores vary between runs. If a score seems off, offer to run it again.
- Local dev server results differ from production (no minification, no CDN, no HTTP/2). Note this if auditing locally.
- The site uses Hugo's CSS fingerprinting and minification in production (`hugo --minify`), so some performance warnings on local may not apply.
