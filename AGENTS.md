# Project: bojan.delic.rs

Personal website for **Bojan Delić**, hosted at https://bojan.delic.rs/

## Tech Stack

- **Static site generator**: Hugo (v0.155+)
- **Theme**: Custom minimal theme at `themes/minimal/`
- **Hosting**: Cloudflare Pages
- **CI**: GitHub Actions (`.github/workflows/deploy.yml`)
- **No JS frameworks** — minimal JavaScript (theme toggle only)
- **Build command**: `hugo` (output in `public/`)
- **Dev server**: `hugo server --buildDrafts`

## Owner Info

- Name: Bojan Delić
- Tagline: "Problem solver, computer programmer, IT enthusiast, geek"
- GitHub: https://github.com/delicb
- LinkedIn: https://www.linkedin.com/in/bojandelic/
- Twitter/X: https://x.com/dercibald
- Email: bojan@delic.rs

## Site Structure

### Content (`content/`)
- **Blog** (`blog/`) — posts as page bundles (`blog/<slug>/index.md`)
- **Projects** (`projects/`) — list page, data from `data/projects.yaml`
- **Resume** (`resume/`) — list page, data from `data/resume.yaml`
- **Quotes** (`quotes/`) — list page, data from `data/quotes.yaml`

### Blog Post URLs

Blog posts use `/blog/:year/:month/:slug/` permalink pattern (configured in `hugo.toml` under `[permalinks]`). The slug comes from the folder name. Year and month come from the `date` in front matter.

### Blog Post Features

- **Cover images** — optional. Place a `cover.*` file in the post's page bundle; the template picks it up automatically and renders it above the title.
- **Code blocks** — support optional line numbers (`{linenos=table}`) and line highlighting (`{hl_lines=[...]}`). See `SYNTAX.md` for full reference.
- **Include shortcode** — `{{< include file="example.py" >}}` renders code from files in the page bundle, with optional line ranges and highlighting.
- **Reading time** — displayed on both list and single post views, calculated by Hugo.
- **Pagination** — blog list is paginated (10 posts per page, configurable via `pagerSize` in `hugo.toml`).
- **RSS** — available at `/blog/index.xml`, auto-discovered via `<link rel="alternate">`.

### Data Files (`data/`)
Projects, resume, and quotes are driven by YAML data files, not individual content pages. Edit the YAML to update these sections.

- **Projects** — support `featured: true` flag for prominent display at the top of the page.
- **Quotes** — flat list of text/author/source entries.

### Theme (`themes/minimal/`)
- `assets/css/` — styling split into focused files, concatenated by Hugo Pipes into one output file:
  - `base.css` — design tokens (CSS custom properties), reset, theme toggle
  - `layout.css` — header, footer, hero, home grid, post list, pagination, 404
  - `article.css` — blog post typography, code blocks, tables, cover images
  - `sections.css` — quotes, resume, projects (featured cards + list)
  - `responsive.css` — mobile breakpoints, print styles
  - `syntax.css` — chroma syntax highlighting (light/dark), line numbers, line highlighting
- `layouts/shortcodes/include.html` — shortcode for including code from page bundle files.
- `layouts/partials/` — head (with SEO meta), header, footer, theme toggle, JSON-LD.
- `layouts/404.html` — custom 404 page.

### Static Files (`static/`)
- Favicons in all standard sizes (generated from owner photo)
- `og-default.jpg` — default Open Graph image (used when post has no cover)
- `_headers` — Cloudflare Pages security headers
- `.well-known/security.txt` — security contact info (RFC 9116)
- `robots.txt` — allows all crawlers
- `imessage-public-verification-code.txt` — Apple iMessage verification token, must remain

## SEO / Meta

- **Open Graph + Twitter Cards** — on every page, with post-specific metadata for articles
- **JSON-LD** — `Person` schema on homepage, `BlogPosting` schema on articles
- **Canonical URLs** — `<link rel="canonical">` on every page
- **Sitemap** — auto-generated at `/sitemap.xml`
- **Font preconnect** — for cdnjs CDN (Font Awesome)

## Design Principles

- **Minimalist** — few colors, clean typography, lots of whitespace
- **Light/dark mode** — defaults to viewer's OS preference, with a manual toggle that persists via localStorage
- **CSS-only iteration** — design can be changed by tweaking CSS custom properties only
- **Data-driven sections** — projects, resume, quotes sourced from YAML, not hardcoded in templates
- **Minimal JavaScript** — only used where CSS can't do the job (e.g. theme toggle with localStorage). No frameworks or build tools.

## Reference Files

- `SYNTAX.md` — content authoring reference (code blocks, cover images, include shortcode)
- `LICENSE` — CC BY 4.0

## Files to Preserve

- `static/imessage-public-verification-code.txt` — Apple iMessage verification token, must remain
- `static/robots.txt` — pre-existing, allows all crawlers
- `static/.well-known/security.txt` — update `Expires` date annually

## CI/Deployment

GitHub Actions workflow builds with `hugo --minify` and deploys to Cloudflare Pages via Wrangler. Triggered on push to `main`. Required secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. Required variable: `CLOUDFLARE_PROJECT_NAME`.
