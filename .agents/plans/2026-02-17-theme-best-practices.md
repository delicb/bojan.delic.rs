---
date: 2026-02-17
title: Theme Best Practices
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents: []
---

# Theme Best Practices

## Goal / Overview

A review of the Hugo site and custom theme (`themes/minimal/`) identified 19 issues ranging from
security gaps to Hugo convention violations and SEO metadata problems. This plan addresses all of
them in 8 sequential batches, each producing one commit.

The theme is a portable Hugo theme (must work for any site, not just this one). The site-level
config is at `hugo.toml` in the project root. Both must be kept in sync where config is duplicated
(site, theme defaults, and exampleSite).

**Hugo version:** 0.155.3 extended (installed via Homebrew).

## Dependencies

No new packages, tools, or external dependencies. All changes are to Hugo templates, CSS, JS, and
TOML config.

## File Structure

### Files modified (by batch)

**Batch 1** — Security & correctness:

- `themes/minimal/layouts/partials/head.html`
- `hugo.toml`
- `themes/minimal/hugo.toml`
- `themes/minimal/exampleSite/hugo.toml`
- `themes/minimal/theme.toml`

**Batch 2** — Render hook relocation:

- Move 6 files from `themes/minimal/layouts/_default/_markup/` → `themes/minimal/layouts/_markup/`
- Delete empty dir `themes/minimal/layouts/_default/_markup/`

**Batch 3** — JSON-LD & SEO:

- `themes/minimal/layouts/partials/json-ld.html`
- `themes/minimal/layouts/partials/head.html`
- `hugo.toml`

**Batch 4** — HTML lang & theme-color:

- `hugo.toml`
- `themes/minimal/exampleSite/hugo.toml`
- `themes/minimal/layouts/partials/head.html`

**Batch 5** — Content quality:

- `themes/minimal/layouts/_default/single.html`
- `themes/minimal/layouts/partials/head.html`
- `archetypes/default.md`

**Batch 6** — Theme hygiene:

- `themes/minimal/.gitignore`
- Delete `themes/minimal/public/` directory

**Batch 7** — Performance (JS extraction):

- Create `themes/minimal/assets/js/main.js`
- `themes/minimal/layouts/_default/baseof.html`

**Batch 8** — Custom RSS:

- Create `themes/minimal/layouts/_default/rss.xml`

## Component Breakdown

---

### Batch 1: Security & Correctness

**1a. Add SRI integrity attribute on stylesheet**

File: `themes/minimal/layouts/partials/head.html`

Find this line (around line 65):

```html
<link rel="stylesheet" href="{{ $style.RelPermalink }}" />
```

Replace with:

```html
<link
  rel="stylesheet"
  href="{{ $style.RelPermalink }}"
  integrity="{{ $style.Data.Integrity }}"
  crossorigin="anonymous"
/>
```

Hugo's `fingerprint` pipe (already in use on the line above) produces `.Data.Integrity`
automatically — it contains a `sha256-...` hash. The `crossorigin="anonymous"` attribute is required
for SRI to work even on same-origin resources when served via CDN.

**1b. Enable Goldmark block & title attributes**

The render hooks for headings, blockquotes, and tables reference `.Attributes`, but the Goldmark
parser doesn't extract them unless explicitly enabled. Without this,
`{{ range $k, $v := .Attributes }}` in `render-heading.html` is always empty, so Markdown like
`## Heading {.my-class}` silently loses the class.

Add to **all three** config files (`hugo.toml`, `themes/minimal/hugo.toml`,
`themes/minimal/exampleSite/hugo.toml`) under `[markup.goldmark]`:

```toml
[markup.goldmark.parser.attribute]
  block = true
  title = true
```

In each file, place this block right after the existing `[markup.goldmark.renderer]` section (or
after `[markup.goldmark.extensions...]` — just ensure it's under `[markup.goldmark]`).

**1c. Bump `min_version` in theme.toml**

File: `themes/minimal/theme.toml`

Change:

```toml
min_version = "0.128.0"
```

To:

```toml
min_version = "0.134.0"
```

Reason: The theme uses table render hooks (Hugo 0.134.0+), blockquote alert render hooks (0.132.0+),
and Goldmark extras like `mark`/`insert`/`subscript`/`superscript` (0.133.0+). The highest
requirement is 0.134.0.

**1d. Remove redundant `noClasses = false`**

Hugo 0.155+ defaults to CSS classes for syntax highlighting. The explicit `noClasses = false` is
unnecessary and misleading.

In **all three** config files, remove this line from `[markup.highlight]`:

```toml
noClasses = false
```

In `themes/minimal/hugo.toml`, update the comment above the `[markup.highlight]` section to:

```toml
[markup.highlight]
  # The theme uses CSS classes for syntax highlighting (see assets/css/syntax.css).
  # Hugo >= 0.155 defaults to CSS classes, so noClasses is not needed.
```

**Commit message:** `fix(theme): add SRI on stylesheet, enable block attributes, bump min_version`

---

### Batch 2: Render Hook Relocation

Hugo's documentation (v0.146+) specifies render hooks go at `layouts/_markup/` as a top-level
directory. The current location `layouts/_default/_markup/` scopes them to the `_default` content
type only. This works by accident because all content types in this site fall back to `_default`,
but it's non-standard and will break if a `layouts/blog/` directory is ever created (blog posts
would lose their render hooks).

**Steps:**

```bash
mkdir -p themes/minimal/layouts/_markup
mv themes/minimal/layouts/_default/_markup/render-*.html themes/minimal/layouts/_markup/
rmdir themes/minimal/layouts/_default/_markup
```

Files moved (6 total):

- `render-blockquote.html`
- `render-codeblock.html`
- `render-heading.html`
- `render-image.html`
- `render-link.html`
- `render-table.html`

No content changes to any of these files — just location.

**Commit message:** `refactor(theme): move render hooks to layouts/_markup/ per Hugo convention`

---

### Batch 3: JSON-LD & SEO Metadata

**3a. Scope JSON-LD `BlogPosting` to blog section only**

File: `themes/minimal/layouts/partials/json-ld.html`

Currently the template emits `BlogPosting` schema for every single page (`.IsPage`), including the
contact page. It should only apply to blog posts.

Find:

```go
{{- else if .IsPage -}}
```

Replace with:

```go
{{- else if and .IsPage (eq .Section (site.Params.blogSection | default "blog")) -}}
```

This uses the same `blogSection` param already used by the footer and RSS discovery, so it stays
consistent.

**3b. Enable `enableGitInfo` for accurate lastmod dates**

File: `hugo.toml`

Add at the top level (e.g., after the `theme = 'minimal'` line):

```toml
enableGitInfo = true
```

This makes `.Lastmod` return the git commit date of the last change to a file, rather than falling
back to `.Date`. Benefits:

- JSON-LD `dateModified` becomes accurate
- Sitemap `<lastmod>` becomes meaningful
- `article:modified_time` Open Graph meta becomes accurate

**3c. Remove `changeFreq` from sitemap config**

File: `hugo.toml`

In the `[sitemap]` section, remove:

```toml
changeFreq = 'weekly'
```

Keep the remaining:

```toml
[sitemap]
  filename = 'sitemap.xml'
```

Reason: Google, Bing, and all major search engines ignore `changefreq` and `priority` in sitemaps.
Including them adds noise for zero benefit.

**3d. Derive `og:locale` from language config**

File: `themes/minimal/layouts/partials/head.html`

Find:

```html
<meta property="og:locale" content="en_US" />
```

Replace with:

```go
<meta property="og:locale" content="{{ replace .Site.Language.LanguageCode "-" "_" }}">
```

Note: Open Graph expects underscore-separated locale codes (e.g., `en_US`), while BCP 47 uses
hyphens (`en-US`). This transformation handles it. After Batch 4 changes `languageCode` to `en`,
this will output `content="en"` which is valid for OG.

**Commit message:** `fix(theme): scope BlogPosting to blog section, enable gitInfo, fix og:locale`

---

### Batch 4: HTML Lang & Theme-Color

**4a. Fix `languageCode` to proper BCP 47 format**

File: `hugo.toml` — change:

```toml
languageCode = 'en-us'
```

To:

```toml
languageCode = 'en'
```

File: `themes/minimal/exampleSite/hugo.toml` — same change.

BCP 47 specifies `en-US` (uppercase region), not `en-us`. Since no US-specific content distinction
is needed, `en` is the cleanest value. This affects `<html lang="...">` and now also `og:locale`
(from Batch 3).

**4b. Add `<meta name="theme-color">` tags**

File: `themes/minimal/layouts/partials/head.html`

Add after the viewport meta tag (line 2), before the description meta:

```html
<meta name="theme-color" content="{{ site.Params.themeColorLight | default "#ffffff" }}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="{{ site.Params.themeColorDark | default "#16161a" }}" media="(prefers-color-scheme: dark)">
```

The defaults (`#ffffff` for light, `#16161a` for dark) match the theme's `--color-bg` CSS custom
properties. Making them param-driven keeps the theme portable — a site using a different accent
color scheme can override them in `hugo.toml`.

No changes needed to `hugo.toml` for this site since the defaults match.

**Commit message:** `fix: use proper BCP 47 language code, add theme-color meta`

---

### Batch 5: Content Quality

**5a. Use post title for cover image alt text, with override**

File: `themes/minimal/layouts/_default/single.html`

Find the cover image block:

```go
  {{ with $cover }}
  <div class="article-cover">
    {{ partial "responsive-image.html" (dict "image" . "alt" "Cover image" "loading" "eager" "fetchpriority" "high") }}
  </div>
  {{ end }}
```

Replace with:

```go
  {{ with $cover }}
  <div class="article-cover">
    {{ $coverAlt := $.Params.coverAlt | default (printf "Cover image for %s" $.Title) }}
    {{ partial "responsive-image.html" (dict "image" . "alt" $coverAlt "loading" "eager" "fetchpriority" "high") }}
  </div>
  {{ end }}
```

Note: Inside `{{ with $cover }}`, the context `.` is the cover resource, so we must use `$.Params`
and `$.Title` to access the page.

This allows authors to set `coverAlt: "A detailed description"` in front matter. If omitted, it
falls back to "Cover image for {title}" which is more descriptive than the current generic "Cover
image".

**5b. Add robots meta tag**

File: `themes/minimal/layouts/partials/head.html`

Add after the description meta tag (line 3):

```html
{{ with .Params.robots }}<meta name="robots" content="{{ . }}" />{{ else }}<meta
  name="robots"
  content="index, follow"
/>{{ end }}
```

This defaults to `index, follow` but allows per-page override via front matter
(`robots: "noindex"`), which is useful for utility pages.

**5c. Align site archetype with theme archetype**

File: `archetypes/default.md`

Replace the current content:

```yaml
---
date: "{{ .Date }}"
draft: true
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
---
```

With the richer theme version:

```yaml
---
title: "{{ replace .File.ContentBaseName `-` ` ` | title }}"
date: { { .Date } }
description: ""
draft: true
tags: []
---
```

The site-level archetype takes precedence over the theme's. Currently it's simpler (missing
`description` and `tags`), which means `hugo new content` produces incomplete front matter. Aligning
with the theme archetype ensures new posts start with all expected fields.

**Commit message:** `fix: improve cover alt text, add robots meta, align archetype with theme`

---

### Batch 6: Theme Hygiene

**6a. Gitignore theme's `public/` directory**

File: `themes/minimal/.gitignore`

Current contents:

```
exampleSite/public/
exampleSite/resources/
.hugo_build.lock
```

Add `/public/` at the top:

```
/public/
exampleSite/public/
exampleSite/resources/
.hugo_build.lock
```

**6b. Delete stale theme build output**

```bash
rm -rf themes/minimal/public/
```

This directory contains stale HTML/CSS/sitemap from a previous `hugo` run inside the theme
directory. It's not tracked in git but its presence is confusing.

**Commit message:** `chore(theme): gitignore public/ directory, remove stale build output`

---

### Batch 7: JS Extraction to Asset Pipeline

**Why:** The `baseof.html` template contains two inline `<script>` blocks (~80 lines total) for:
back-to-top button, code block copy buttons, scroll-reveal animations, and table scroll indicators.
These are not minified by Hugo's HTML minifier and not cacheable across page loads.

**What stays inline:** The theme-detection script in `head.html` and the theme-toggle script in
`header.html` MUST remain inline. They run before first paint to prevent flash-of-wrong-theme
(FOUC). Do not touch these.

**7a. Create JS asset file**

Create: `themes/minimal/assets/js/main.js`

Extract the contents of both `<script>` blocks from `baseof.html` into this file. Remove the
wrapping `<script>` tags and the IIFEs — the file will be loaded with `defer` so it runs after DOM
parsing, making the IIFE wrappers unnecessary. However, keeping a single top-level IIFE is fine to
avoid polluting the global scope.

The file should contain (preserving the exact same logic):

```js
(function () {
  // ---- Back to top ----
  var btn = document.getElementById("back-to-top");
  if (btn) {
    var shown = false;
    function toggle() {
      var shouldShow = window.scrollY > 400;
      if (shouldShow !== shown) {
        shown = shouldShow;
        btn.classList.toggle("visible", shown);
      }
    }
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ---- Code block copy buttons ----
  var copyNotify = document.getElementById("copy-notify");
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;

    var wrapper = btn.closest(".code-block-wrapper");
    if (!wrapper) return;

    var codeEl =
      wrapper.querySelector(".lntd:last-child code") || wrapper.querySelector("pre code");
    if (!codeEl) return;

    var text = codeEl.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add("copied");
        if (copyNotify) {
          copyNotify.textContent = "Copied to clipboard";
        }
        setTimeout(function () {
          btn.classList.remove("copied");
          if (copyNotify) {
            copyNotify.textContent = "";
          }
        }, 2000);
      });
    }
  });

  // ---- Scroll-triggered reveal animations ----
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".scroll-reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".scroll-reveal").forEach(function (el) {
      el.classList.add("revealed");
    });
  }

  // ---- Table horizontal scroll indicators ----
  function updateScroller(s) {
    var w = s.parentElement;
    var canLeft = s.scrollLeft > 0;
    var canRight = s.scrollLeft + s.clientWidth < s.scrollWidth - 1;
    w.classList.toggle("can-scroll-left", canLeft);
    w.classList.toggle("can-scroll-right", canRight);
  }
  document.querySelectorAll(".table-scroller").forEach(function (s) {
    updateScroller(s);
    s.addEventListener("scroll", function () {
      updateScroller(s);
    });
  });
  window.addEventListener("resize", function () {
    document.querySelectorAll(".table-scroller").forEach(updateScroller);
  });
})();
```

**7b. Update baseof.html**

File: `themes/minimal/layouts/_default/baseof.html`

Remove both inline `<script>` blocks (everything between `{{ partial "footer.html" . }}` and
`</body>`, except for the `#copy-notify` div and back-to-top button).

Add this Hugo Pipes snippet just before `</body>`:

```go
  {{ $js := resources.Get "js/main.js" | minify | fingerprint }}
  <script src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" defer></script>
```

The final `baseof.html` should look like:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}">
  <head>
    {{ partial "head.html" . }}
  </head>
  <body>
    {{ partial "header.html" . }}
    <main class="container">{{ block "main" . }}{{ end }}</main>
    {{ partial "footer.html" . }}
    <div id="copy-notify" class="sr-only" aria-live="polite"></div>
    <button class="back-to-top" id="back-to-top" aria-label="Back to top" title="Back to top">
      {{ partial "icon.html" (dict "name" "arrow-up") }}
    </button>
    {{ $js := resources.Get "js/main.js" | minify | fingerprint }}
    <script src="{{ $js.RelPermalink }}" integrity="{{ $js.Data.Integrity }}" defer></script>
  </body>
</html>
```

**Why `defer` works:** All the JS queries the DOM (`getElementById`, `querySelectorAll`). With
`defer`, the script executes after the HTML is fully parsed but before `DOMContentLoaded`. The
existing code doesn't use `DOMContentLoaded` listeners — it runs immediately inside IIFEs and
expects the DOM to be ready. With `defer`, the DOM IS ready, so no behavior change.

**Commit message:** `perf(theme): move inline JS to asset pipeline with minify and SRI`

---

### Batch 8: Custom RSS Template

**Why:** The built-in Hugo RSS template dumps the full `.Content` into `<description>`, which
includes render hook artifacts: inline SVG icons (external link indicators), copy buttons inside
code blocks, heading anchor links, and table wrapper divs. This makes the RSS feed bloated and ugly
in feed readers.

A custom template gives control over what goes into the feed: clean content, proper cover image
references, and correct metadata.

**Create:** `themes/minimal/layouts/_default/rss.xml`

```xml
{{- $blogSection := site.Params.blogSection | default "blog" -}}
{{- $pctx := . -}}
{{- if .IsHome -}}
  {{- $pctx = site -}}
{{- end -}}
{{- $pages := slice -}}
{{- if .IsSection -}}
  {{- $pages = .RegularPages -}}
{{- else -}}
  {{- $pages = where site.RegularPages "Section" $blogSection -}}
{{- end -}}
{{- $limit := site.Config.Services.RSS.Limit -}}
{{- if ge $limit 1 -}}
  {{- $pages = $pages | first $limit -}}
{{- end -}}
{{- printf "<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?>" | safeHTML }}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{{ if .IsSection }}{{ .Title }} — {{ end }}{{ site.Title }}</title>
    <link>{{ .Permalink }}</link>
    <description>{{ with .Description }}{{ . }}{{ else }}{{ with site.Params.description }}{{ . }}{{ end }}{{ end }}</description>
    <generator>Hugo {{ hugo.Version }}</generator>
    <language>{{ site.Language.LanguageCode }}</language>{{ with site.Copyright }}
    <copyright>{{ . }}</copyright>{{ end }}
    <lastBuildDate>{{ now.Format "Mon, 02 Jan 2006 15:04:05 -0700" }}</lastBuildDate>
    <atom:link href="{{ .Permalink }}index.xml" rel="self" type="application/rss+xml" />
    {{- range $pages }}
    <item>
      <title>{{ .Title }}</title>
      <link>{{ .Permalink }}</link>
      <pubDate>{{ .Date.Format "Mon, 02 Jan 2006 15:04:05 -0700" }}</pubDate>
      <guid>{{ .Permalink }}</guid>
      <description>{{ with .Description }}{{ . }}{{ else }}{{ .Summary | plainify | htmlUnescape }}{{ end }}</description>
      <content:encoded>{{ .Content | html }}</content:encoded>
      {{- $cover := .Resources.GetMatch "cover.*" }}
      {{- with $cover }}
      {{- $processed := .Process "resize 1200x" }}
      <enclosure url="{{ $processed.Permalink }}" length="{{ $processed.Content | len }}" type="{{ $processed.MediaType }}" />
      {{- end }}
    </item>
    {{- end }}
  </channel>
</rss>
```

Key design decisions:

- Uses `<description>` for plain-text summary (description or plainified summary) — this is what
  most feed readers show in previews
- Uses `<content:encoded>` (RSS content module namespace) for full HTML content — feed readers that
  support it show the full post
- Includes cover image as `<enclosure>` — feed readers like Feedly display this as the post
  thumbnail
- Channel title uses "Section — Site Title" format for section feeds, just "Site Title" for home
  feed
- Respects `services.rss.limit` config
- For home page feeds, filters to blog section only (matches the site's `outputs` config that
  generates RSS for home and sections)

**Commit message:** `feat(theme): add custom RSS template with full content and cover images`

---

## Integration Points

- **Config duplication:** Three TOML files must stay in sync: `hugo.toml` (site),
  `themes/minimal/hugo.toml` (theme defaults), `themes/minimal/exampleSite/hugo.toml` (example).
  Batches 1 and 4 touch all three.
- **Hugo Pipes:** Batches 1 and 7 add `integrity` attributes. The `fingerprint` function already
  runs on CSS (Batch 1 just reads its output). Batch 7 adds a new `minify | fingerprint` pipeline
  for JS.
- **Render hooks → layouts/\_markup/:** After Batch 2, all render hooks are at the theme's top-level
  `_markup/` dir. Site-level overrides would go in `layouts/_markup/` at the project root.
- **RSS feed:** The custom template (Batch 8) replaces Hugo's built-in for all RSS outputs. It's a
  `_default/rss.xml` in the theme so it's overridable at the site level.

## Implementation Order

Execute batches sequentially. Each batch is one commit. Run `hugo` after each batch to verify zero
warnings/errors.

- [x] **Batch 1:** SRI, block attributes, min_version, noClasses cleanup
- [x] **Batch 2:** Move render hooks to `layouts/_markup/`
- [x] **Batch 3:** JSON-LD scoping, enableGitInfo, sitemap cleanup, og:locale
- [x] **Batch 4:** languageCode fix, theme-color meta
- [x] **Batch 5:** Cover alt text, robots meta, archetype alignment
- [x] **Batch 6:** Theme .gitignore, delete stale public/
- [x] **Batch 7:** JS extraction to asset pipeline
- [x] **Batch 8:** Custom RSS template

## Error Handling

- **SRI mismatch:** If the integrity hash doesn't match the file content (e.g., CDN corruption), the
  browser blocks the resource. This is the intended security behavior. Locally served files won't
  have this issue.
- **Missing `js/main.js`:** If the file doesn't exist in `assets/`, `resources.Get` returns nil and
  `minify` will panic. The file must exist before building.
- **RSS `$processed.Content | len`:** The `len` of processed image content returns bytes. If a cover
  image is very large, this is fine — `<enclosure>` `length` is just advisory.
- **`enableGitInfo` in CI:** The GitHub Actions workflow uses `actions/checkout@v4` which does a
  shallow clone by default. Shallow clones have limited git history. For accurate `lastmod`, the
  checkout step may need `fetch-depth: 0`. Check if `.Lastmod` values look correct after enabling.
  If they're all the same date, add `fetch-depth: 0` to the checkout step in
  `.github/workflows/deploy.yml`.

## Testing Strategy

After each batch:

1. **Build check:** Run `hugo` and verify zero warnings/errors and same page count
2. **Output inspection:** Spot-check relevant HTML in `public/`:
   - Batch 1: Check `<link rel="stylesheet">` has `integrity="sha256-..."` in `public/index.html`
   - Batch 1: Verify no `style="..."` inline syntax highlighting in any blog post HTML
   - Batch 2: Verify render hooks still work — check a blog post for: heading anchor links
     (`class="heading-anchor"`), external link icons (`class="external-link-icon"`), copy buttons
     (`class="copy-btn"`), responsive images (`<picture>`), table wrappers
     (`class="table-wrapper"`), alert blockquotes (`class="alert"`)
   - Batch 3: Check JSON-LD on a blog post contains `BlogPosting`; check contact page has NO JSON-LD
     `BlogPosting`; check `<lastmod>` in `sitemap.xml` differs from publish dates (requires git
     history); check `og:locale` value
   - Batch 4: Check `<html lang="en">` (not `en-us`); check `<meta name="theme-color">` appears
     twice (light/dark)
   - Batch 5: Check cover image `alt` text on a blog post; check `<meta name="robots">` exists; run
     `hugo new content blog/test-post/index.md` and verify front matter has `description` and `tags`
     fields, then delete the test post
   - Batch 6: Verify `themes/minimal/public/` is gone
   - Batch 7: Check `<script src="/js/main.min.*.js" integrity="sha256-..." defer>` appears in HTML;
     verify NO inline `<script>` blocks remain in `<body>` (except the notification div);
     **functional test:** run `hugo server`, open in browser, verify back-to-top button, code copy,
     scroll-reveal animations, and table scroll all work
   - Batch 8: Check `public/blog/index.xml` — verify `<content:encoded>` has full content,
     `<description>` has plain text summary, cover images appear as `<enclosure>`, no copy button
     HTML in feed

3. **Full build:** Run `hugo --minify` (production mode) and verify no breakage

## Decision Points

| Decision                  | Choice                                                                | Reason                                                                                                 |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| SRI on CSS                | Yes, using `fingerprint`'s `.Data.Integrity`                          | Already fingerprinting; SRI is free and improves security                                              |
| Goldmark attributes       | Enable both `block` and `title`                                       | Render hooks already reference `.Attributes`; without this they silently discard user-provided classes |
| Render hook location      | `layouts/_markup/` (global)                                           | Hugo convention since v0.146; `_default/_markup/` is scoped to one content type                        |
| JSON-LD scoping           | Check `.Section` against `blogSection` param                          | Reuses existing param; avoids `BlogPosting` on non-blog pages                                          |
| `enableGitInfo`           | Yes                                                                   | Gives accurate `lastmod` for sitemap and JSON-LD at zero cost                                          |
| `changeFreq` removal      | Remove entirely                                                       | All major search engines ignore it                                                                     |
| `og:locale`               | Derived from `languageCode`                                           | Previously hardcoded to `en_US`; now dynamic                                                           |
| `languageCode`            | `en` (not `en-US` or `en-us`)                                         | No US-specific content; simpler value                                                                  |
| `theme-color`             | Param-driven with defaults                                            | Keeps theme portable                                                                                   |
| Cover alt text            | `coverAlt` param → fallback to title-based text                       | More descriptive than generic "Cover image"                                                            |
| Robots meta               | Default `index, follow`, overridable via front matter                 | Belt-and-suspenders approach                                                                           |
| Archetype                 | Align site with theme version                                         | Ensures `hugo new content` produces complete front matter                                              |
| JS extraction scope       | Only `baseof.html` scripts; `head.html` and `header.html` stay inline | Theme detection/toggle must run before first paint to prevent FOUC                                     |
| JS loading                | `defer` attribute                                                     | DOM is ready when deferred scripts execute; matches existing code's assumptions                        |
| RSS approach              | Custom `rss.xml` with `content:encoded`                               | Built-in dumps render hook artifacts (SVGs, copy buttons) into feed                                    |
| Contact template in theme | Keep as-is (intentional)                                              | The theme version is param-driven and gracefully degrades; site-level overrides it                     |

### Rejected approaches

- **Moving all JS to asset pipeline (including theme toggle):** Rejected because the theme detection
  script in `<head>` and the toggle handler in `<header>` must execute synchronously before paint.
  An external `defer`'d script would cause a flash of wrong theme on every page load.
- **Using `js.Build` (ESBuild) instead of plain `minify`:** Overkill for ~80 lines of vanilla JS
  with no imports. `minify` is sufficient and doesn't require ESBuild.
- **Adding `X-Robots-Tag` header:** Would require changes to `static/_headers` (Cloudflare Pages). A
  `<meta>` tag achieves the same result more portably.
- **Removing `sitemap.filename`:** Kept because `sitemap.xml` is the standard filename and the
  explicit config documents intent.

## Future Enhancements

- **Content Security Policy (CSP) nonce for inline scripts:** The two remaining inline scripts
  (theme detection in `head.html`, toggle in `header.html`) could use CSP nonces for stricter
  security, but this requires Hugo to generate a per-build nonce and inject it into headers.
- **Font preloads via Hugo Pipes:** Currently fonts are in `static/fonts/` with hardcoded paths.
  Moving them to `assets/fonts/` and using `resources.Get` would enable fingerprinting and
  subpath-safe URLs.
- **Per-section RSS templates:** If non-blog sections ever need RSS, separate `section.rss.xml`
  templates could be created.
- **JSON-LD for non-blog pages:** Could add `WebPage` schema for section list pages and
  `ContactPage` for the contact page.
- **Structured data testing:** Run Google's Rich Results Test against the site to validate JSON-LD.

## Implementation Progress

All 8 batches completed successfully with 8 commits:

1. **Batch 1** (`d9f5ed7`): Added SRI integrity attribute on stylesheet link, enabled Goldmark
   block/title attributes in all 3 config files, bumped `min_version` to 0.134.0, removed redundant
   `noClasses = false`.
2. **Batch 2** (`698b87c`): Moved 6 render hook files from `layouts/_default/_markup/` to
   `layouts/_markup/`. Verified all render hooks still produce correct output.
3. **Batch 3** (`a30a172`): Scoped `BlogPosting` JSON-LD to blog section only (contact page no
   longer gets it), enabled `enableGitInfo`, removed `changeFreq` from sitemap config, made
   `og:locale` dynamic from language config.
4. **Batch 4** (`79a8d13`): Changed `languageCode` to `en` (BCP 47) in both site and exampleSite
   configs, added two `theme-color` meta tags for light/dark with param-driven defaults.
5. **Batch 5** (`3f33f0c`): Cover image alt text now uses post title (with `coverAlt` override),
   added `robots` meta tag defaulting to `index, follow`, aligned site archetype with theme
   archetype (added `description` and `tags` fields).
6. **Batch 6** (`3156d1c`): Added `/public/` to theme `.gitignore`, confirmed stale build output
   directory was already absent.
7. **Batch 7** (`12a9ca5`): Extracted ~80 lines of inline JS (back-to-top, copy buttons,
   scroll-reveal, table scroll indicators) into `assets/js/main.js`, loaded via Hugo Pipes with
   minify, fingerprint, SRI, and `defer`. Theme detection/toggle scripts remain inline to prevent
   FOUC.
8. **Batch 8** (`bb60f0c`): Created custom RSS template with `content:encoded` for full HTML
   content, plain-text `description` for summaries, and `enclosure` for cover images. Verified
   descriptions are clean text without render hook artifacts.

All builds passed with zero warnings/errors. `hugo --minify` production build verified successful.
