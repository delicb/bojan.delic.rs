---
date: 2026-02-13
title: Theme Decoupling
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents: []
---

# Theme Decoupling: Separate Site Content from Theme

## Goal/Overview

The Hugo theme at `themes/minimal/` is a custom-built personal website theme that currently has tight coupling to the specific site content. The goal is to make the theme **portable** — someone should be able to copy `themes/minimal/` into a fresh Hugo site, configure `hugo.toml`, and have a working theme without broken links, missing assets, or hosting-specific code.

**This is NOT about creating a published theme package** (no `exampleSite/`, screenshots, or `theme.toml` enrichment). It's purely about separation of concerns between theme and site content.

## Dependencies

None. No new tools, packages, or systems are needed. All changes use existing Hugo features (menus, params, template logic).

## Current Coupling Points

1. **Navigation** — Header hardcodes 5 specific nav links (`/blog/`, `/resume/`, `/projects/`, `/quotes/`, `/contact/`)
2. **Homepage social links** — Hardcodes GitHub, LinkedIn, Twitter, Contact with specific icons
3. **Homepage cards** — Hardcodes 4 section cards with site-specific descriptions
4. **Footer social links** — Hardcodes GitHub, LinkedIn, Twitter, Email — always rendered even when params are empty (broken `href=""`)
5. **Contact form layout** — Cloudflare Turnstile + `/api/contact` endpoint baked into theme
6. **Font files** — Theme CSS references fonts that only exist in site's `static/fonts/`, not in theme
7. **JSON-LD** — Hardcodes `@type: Person` and pulls `sameAs` from specific individual params (`github`, `linkedin`, `twitter`)

## File Structure

### Files to modify (in theme)

| File | Change |
|---|---|
| `themes/minimal/layouts/partials/header.html` | Replace hardcoded nav with Hugo menu loop |
| `themes/minimal/layouts/index.html` | Replace hardcoded social links + cards with param-driven loops |
| `themes/minimal/layouts/partials/footer.html` | Replace hardcoded social links with param-driven loop, guard all sections |
| `themes/minimal/layouts/partials/json-ld.html` | Use `socialLinks` for `sameAs`, make `@type` configurable |
| `themes/minimal/static/fonts/` | **Create directory**, copy font files here |

### Files to modify (in site)

| File | Change |
|---|---|
| `hugo.toml` | Add `[[menus.main]]` entries, restructure social params into `[[params.socialLinks]]` and `[[params.homeCards]]` |

### Files to move (theme → site)

| From | To |
|---|---|
| `themes/minimal/layouts/contact/single.html` | `layouts/contact/single.html` |

### Files to delete (from theme)

| File | Reason |
|---|---|
| `themes/minimal/layouts/contact/single.html` | Moved to site level (after copy) |
| `themes/minimal/layouts/contact/` | Empty directory after move |

## Component Breakdown

### 1. Data-driven navigation via Hugo menus

**File:** `themes/minimal/layouts/partials/header.html`

Replace the 5 hardcoded `<a>` tags with a loop over Hugo's built-in menu system. The theme toggle button stays as-is (it's theme functionality, not content).

**Current code (to replace):**
```html
<nav class="site-nav">
  <a href="/blog/"{{ if hasPrefix .RelPermalink "/blog/" }} class="active"{{ end }}>Blog</a>
  <a href="/resume/"{{ if hasPrefix .RelPermalink "/resume/" }} class="active"{{ end }}>Resume</a>
  <a href="/projects/"{{ if hasPrefix .RelPermalink "/projects/" }} class="active"{{ end }}>Projects</a>
  <a href="/quotes/"{{ if hasPrefix .RelPermalink "/quotes/" }} class="active"{{ end }}>Quotes</a>
  <a href="/contact/"{{ if hasPrefix .RelPermalink "/contact/" }} class="active"{{ end }}>Contact</a>
  <button class="theme-toggle" ...>...</button>
</nav>
```

**New code:**
```html
<nav class="site-nav">
  {{ range .Site.Menus.main }}
    <a href="{{ .URL }}"{{ if or ($.IsMenuCurrent "main" .) ($.HasMenuCurrent "main" .) }} class="active"{{ end }}>{{ .Name }}</a>
  {{ end }}
  <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark/light mode">
    <span class="icon-sun">☀️</span>
    <span class="icon-moon">🌙</span>
  </button>
</nav>
```

**Note:** `$.IsMenuCurrent` handles exact matches, `$.HasMenuCurrent` handles child pages (e.g. a blog post should highlight "Blog"). The `$` is needed to access the page context inside the `range` loop.

**Corresponding site config (in `hugo.toml`):**
```toml
[[menus.main]]
  name = "Blog"
  url = "/blog/"
  weight = 1

[[menus.main]]
  name = "Resume"
  url = "/resume/"
  weight = 2

[[menus.main]]
  name = "Projects"
  url = "/projects/"
  weight = 3

[[menus.main]]
  name = "Quotes"
  url = "/quotes/"
  weight = 4

[[menus.main]]
  name = "Contact"
  url = "/contact/"
  weight = 5
```

### 2. Data-driven homepage social links

**File:** `themes/minimal/layouts/index.html`

Replace the hardcoded social link block with a loop over `site.Params.socialLinks`.

**Current code (the `<div class="social-links">` block):**
```html
<div class="social-links">
  <a href="{{ .Site.Params.github }}" class="social-pill" title="GitHub">
    {{ partial "icon.html" (dict "name" "github") }} <span>GitHub</span>
  </a>
  <a href="{{ .Site.Params.linkedin }}" class="social-pill" title="LinkedIn">
    {{ partial "icon.html" (dict "name" "linkedin") }} <span>LinkedIn</span>
  </a>
  <a href="{{ .Site.Params.twitter }}" class="social-pill" title="X (Twitter)">
    {{ partial "icon.html" (dict "name" "x-twitter") }} <span>X</span>
  </a>
  <a href="/contact/" class="social-pill" title="Contact">
    {{ partial "icon.html" (dict "name" "envelope") }} <span>Contact</span>
  </a>
</div>
```

**New code:**
```html
{{ with .Site.Params.socialLinks }}
<div class="social-links">
  {{ range . }}
  <a href="{{ .url }}" class="social-pill" title="{{ .name }}">
    {{ partial "icon.html" (dict "name" .icon) }} <span>{{ .name }}</span>
  </a>
  {{ end }}
</div>
{{ end }}
```

**Corresponding site config:**
```toml
[[params.socialLinks]]
  name = "GitHub"
  url = "https://github.com/delicb"
  icon = "github"

[[params.socialLinks]]
  name = "LinkedIn"
  url = "https://www.linkedin.com/in/bojandelic/"
  icon = "linkedin"

[[params.socialLinks]]
  name = "X"
  url = "https://x.com/dercibald"
  icon = "x-twitter"

[[params.socialLinks]]
  name = "Contact"
  url = "/contact/"
  icon = "envelope"
```

### 3. Data-driven homepage cards

**File:** `themes/minimal/layouts/index.html`

Replace the hardcoded card grid with a loop over `site.Params.homeCards`.

**Current code (the `<section class="home-sections ...">` block):**
```html
<section class="home-sections scroll-reveal">
  <div class="home-grid">
    <a href="/blog/" class="home-card">
      <h2>Blog</h2>
      <p>Thoughts on programming, technology, and other things.</p>
    </a>
    <a href="/projects/" class="home-card">
      <h2>Projects</h2>
      <p>Open source projects and side work.</p>
    </a>
    <a href="/resume/" class="home-card">
      <h2>Resume</h2>
      <p>Professional experience and skills.</p>
    </a>
    <a href="/quotes/" class="home-card">
      <h2>Quotes</h2>
      <p>A collection of quotes I find inspiring or thought-provoking.</p>
    </a>
  </div>
</section>
```

**New code:**
```html
{{ with .Site.Params.homeCards }}
<section class="home-sections scroll-reveal">
  <div class="home-grid">
    {{ range . }}
    <a href="{{ .url }}" class="home-card">
      <h2>{{ .title }}</h2>
      <p>{{ .description }}</p>
    </a>
    {{ end }}
  </div>
</section>
{{ end }}
```

**Corresponding site config:**
```toml
[[params.homeCards]]
  title = "Blog"
  description = "Thoughts on programming, technology, and other things."
  url = "/blog/"

[[params.homeCards]]
  title = "Projects"
  description = "Open source projects and side work."
  url = "/projects/"

[[params.homeCards]]
  title = "Resume"
  description = "Professional experience and skills."
  url = "/resume/"

[[params.homeCards]]
  title = "Quotes"
  description = "A collection of quotes I find inspiring or thought-provoking."
  url = "/quotes/"
```

### 4. Data-driven footer social links

**File:** `themes/minimal/layouts/partials/footer.html`

Replace the hardcoded social links with a loop over the same `socialLinks` param. Guard the "latest post" section and RSS link. Make the blog section name configurable.

**Current full file:**
```html
<footer class="site-footer">
  <div class="container">
    {{ with (where .Site.RegularPages "Section" "blog" | first 1) }}
    {{ range . }}
    <div class="footer-latest">
      <span class="footer-latest-label">Latest post</span>
      <a href="{{ .RelPermalink }}" class="footer-latest-link">{{ .Title }}</a>
    </div>
    {{ end }}
    {{ end }}
    <div class="footer-social">
      <a href="{{ .Site.Params.github }}" title="GitHub">{{ partial "icon.html" (dict "name" "github") }}</a>
      <a href="{{ .Site.Params.linkedin }}" title="LinkedIn">{{ partial "icon.html" (dict "name" "linkedin") }}</a>
      <a href="{{ .Site.Params.twitter }}" title="X (Twitter)">{{ partial "icon.html" (dict "name" "x-twitter") }}</a>
      <a href="mailto:{{ .Site.Params.email }}" title="Email">{{ partial "icon.html" (dict "name" "envelope") }}</a>
      <a href="/blog/index.xml" title="RSS Feed">{{ partial "icon.html" (dict "name" "rss") }}</a>
    </div>
    <p>&copy; {{ now.Year }} {{ .Site.Title }}. Built with <a href="https://gohugo.io">Hugo</a>.</p>
  </div>
</footer>
```

**New full file:**
```html
<footer class="site-footer">
  <div class="container">
    {{- $blogSection := .Site.Params.blogSection | default "blog" -}}
    {{ with (where .Site.RegularPages "Section" $blogSection | first 1) }}
    {{ range . }}
    <div class="footer-latest">
      <span class="footer-latest-label">Latest post</span>
      <a href="{{ .RelPermalink }}" class="footer-latest-link">{{ .Title }}</a>
    </div>
    {{ end }}
    {{ end }}
    {{ if or .Site.Params.socialLinks .Site.Params.email }}
    <div class="footer-social">
      {{ range .Site.Params.socialLinks }}
      <a href="{{ .url }}" title="{{ .name }}">{{ partial "icon.html" (dict "name" .icon) }}</a>
      {{ end }}
      {{ with .Site.Params.email }}
      <a href="mailto:{{ . }}" title="Email">{{ partial "icon.html" (dict "name" "envelope") }}</a>
      {{ end }}
      {{ with $.Site.GetPage (printf "/%s" ($blogSection)) }}
        {{ with .OutputFormats.Get "rss" }}
      <a href="{{ .Permalink }}" title="RSS Feed">{{ partial "icon.html" (dict "name" "rss") }}</a>
        {{ end }}
      {{ end }}
    </div>
    {{ end }}
    <p>&copy; {{ now.Year }} {{ .Site.Title }}. Built with <a href="https://gohugo.io">Hugo</a>.</p>
  </div>
</footer>
```

**Key changes:**
- Social links loop over `socialLinks` param — same data source as homepage
- Email gets its own `{{ with }}` guard (it's `mailto:`, not a social profile URL, so it stays as a separate param)
- RSS link is guarded — only renders if the blog section exists and has RSS output
- Blog section name is configurable via `params.blogSection` (defaults to `"blog"`)
- Note: the `socialLinks` entries for the footer intentionally exclude the "Contact" entry that the homepage might have — the footer social links are profile URLs, not page links. This works naturally because the contact entry on the homepage uses a relative URL `/contact/` and has `icon = "envelope"`. In the footer, email is handled separately via `mailto:`. The contact social pill will appear in the footer too (linking to `/contact/`), which is acceptable — or the site owner can use separate param lists if they want different links in each location. **Keep it simple for now** and use the same list; the slight duplication is harmless.

**Wait — actually, re-reading the current footer:** it has Email (mailto) as separate from the social profiles, and doesn't have a link to `/contact/`. The homepage has a `/contact/` pill but no `mailto:`. These are intentionally different sets. To keep this flexibility without overcomplicating things:
- `socialLinks` is used for profile links (both homepage and footer)
- `email` stays as a separate param, used only in footer for `mailto:`
- The homepage `/contact/` link is just included as a `socialLinks` entry — it shows in the footer too, but that's fine

If the site owner doesn't want the Contact pill in the footer, they can exclude it from `socialLinks` and add a separate Contact entry only for the homepage. But that's over-engineering for now. The simple approach works.

### 5. Move contact form layout to site level

**Action:** Move `themes/minimal/layouts/contact/single.html` → `layouts/contact/single.html`

This file contains:
- Cloudflare Turnstile integration (external JS, `turnstileSiteKey` param)
- A form posting to `/api/contact` (Cloudflare Pages Function)
- Hosting-specific error handling

This is infrastructure-specific and doesn't belong in a generic theme. Once moved, the theme's `_default/single.html` will handle any content page with `layout: single`, and the site-level override takes precedence for the contact section.

**Steps:**
1. Create `layouts/contact/` directory at site root (if not exists)
2. Copy `themes/minimal/layouts/contact/single.html` → `layouts/contact/single.html`
3. Delete `themes/minimal/layouts/contact/single.html`
4. Delete the now-empty `themes/minimal/layouts/contact/` directory

The `turnstileSiteKey` param in `hugo.toml` stays — it's a site config concern, not a theme concern.

### 6. Copy font files into theme

**Action:** Copy font files so the theme is self-contained.

```bash
mkdir -p themes/minimal/static/fonts
cp static/fonts/bricolage-grotesque-latin.woff2 themes/minimal/static/fonts/
cp static/fonts/lexend-latin.woff2 themes/minimal/static/fonts/
```

Hugo merges `static/` from both theme and site, with site taking precedence. So:
- The fonts now ship with the theme (portability)
- The site's `static/fonts/` can still override them (customisation)
- The existing site continues to work identically

**Note:** Keep `static/fonts/` at the site level too — don't delete them. Having fonts in both places is fine; site-level takes precedence. If someone copies just the theme, they get the fonts. If they also have site-level fonts, those win. No conflict.

### 7. Configurable JSON-LD

**File:** `themes/minimal/layouts/partials/json-ld.html`

**Current issues:**
- Homepage hardcodes `@type: "Person"` — won't work for org/project sites
- `sameAs` array pulls from individual params (`github`, `linkedin`, `twitter`) with a potential leading-comma bug when `github` is empty but `linkedin` isn't

**New code:**
```html
{{- if .IsHome -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "{{ .Site.Params.jsonLdType | default "Person" }}",
  "name": "{{ .Site.Title }}",
  "url": "{{ .Site.BaseURL }}",
  "description": "{{ .Site.Params.description }}"
  {{- with .Site.Params.socialLinks -}}
    {{- $urls := slice -}}
    {{- range . -}}
      {{- if strings.HasPrefix .url "http" -}}
        {{- $urls = $urls | append .url -}}
      {{- end -}}
    {{- end -}}
    {{- with $urls }},
  "sameAs": [{{ range $i, $url := . }}{{ if $i }},{{ end }}"{{ $url }}"{{ end }}]
    {{- end -}}
  {{- end -}}
}
</script>
{{- else if .IsPage -}}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ .Title }}",
  "description": "{{ with .Description }}{{ . }}{{ else }}{{ .Summary | plainify | truncate 160 }}{{ end }}",
  "url": "{{ .Permalink }}",
  "datePublished": "{{ .Date.Format "2006-01-02" }}",
  "dateModified": "{{ .Lastmod.Format "2006-01-02" }}",
  "author": {
    "@type": "Person",
    "name": "{{ .Site.Title }}",
    "url": "{{ .Site.BaseURL }}"
  },
  "publisher": {
    "@type": "Person",
    "name": "{{ .Site.Title }}"
  }
  {{- $cover := .Resources.GetMatch "cover.*" -}}
  {{- with $cover -}}
    {{- $processed := .Process "fill 1200x630 center jpg q85" -}},
  "image": "{{ $processed.Permalink }}"
  {{- end }}
  {{- with .Params.tags }},
  "keywords": "{{ delimit . ", " }}"
  {{- end }}
}
</script>
{{- end -}}
```

**Key changes:**
- `@type` reads from `params.jsonLdType`, defaults to `"Person"`
- `sameAs` is built by looping over `socialLinks`, filtering to only absolute URLs (skips relative links like `/contact/`)
- Comma handling is correct (no leading comma bug)
- The `BlogPosting` section for individual pages is unchanged (it's generic enough)

### 8. Site-level `hugo.toml` updates

Replace the individual social params with the new structured params. Keep `email` as a standalone param (used for `mailto:` in footer).

**Params to remove:**
```toml
github = 'https://github.com/delicb'
linkedin = 'https://www.linkedin.com/in/bojandelic/'
twitter = 'https://x.com/dercibald'
twitterHandle = '@dercibald'
```

**Params to add:**
```toml
[[params.socialLinks]]
  name = "GitHub"
  url = "https://github.com/delicb"
  icon = "github"

[[params.socialLinks]]
  name = "LinkedIn"
  url = "https://www.linkedin.com/in/bojandelic/"
  icon = "linkedin"

[[params.socialLinks]]
  name = "X"
  url = "https://x.com/dercibald"
  icon = "x-twitter"

[[params.socialLinks]]
  name = "Contact"
  url = "/contact/"
  icon = "envelope"
```

**Note on `twitterHandle`:** This param is only used in `head.html` for the `<meta name="twitter:site">` tag. It should stay as a standalone param since it's a different format (`@handle` vs URL). **Keep it in `hugo.toml`.**

**Menu entries to add:**
```toml
[[menus.main]]
  name = "Blog"
  url = "/blog/"
  weight = 1

[[menus.main]]
  name = "Resume"
  url = "/resume/"
  weight = 2

[[menus.main]]
  name = "Projects"
  url = "/projects/"
  weight = 3

[[menus.main]]
  name = "Quotes"
  url = "/quotes/"
  weight = 4

[[menus.main]]
  name = "Contact"
  url = "/contact/"
  weight = 5
```

**Home cards to add:**
```toml
[[params.homeCards]]
  title = "Blog"
  description = "Thoughts on programming, technology, and other things."
  url = "/blog/"

[[params.homeCards]]
  title = "Projects"
  description = "Open source projects and side work."
  url = "/projects/"

[[params.homeCards]]
  title = "Resume"
  description = "Professional experience and skills."
  url = "/resume/"

[[params.homeCards]]
  title = "Quotes"
  description = "A collection of quotes I find inspiring or thought-provoking."
  url = "/quotes/"
```

## Integration Points

- **Hugo menus** — Standard Hugo feature. No custom code needed. Templates use `.Site.Menus.main`. Defined in site's `hugo.toml` with `[[menus.main]]` entries.
- **Param arrays** — Hugo natively supports TOML array-of-tables (`[[params.socialLinks]]`) which become slices of maps in templates.
- **Static file merging** — Hugo merges `static/` from theme and site automatically. Site-level files take precedence.
- **Layout override** — Hugo's lookup order means `layouts/contact/single.html` at site level overrides the same path in the theme. This is standard Hugo behavior.

## Implementation Order

- [x] **Step 1: Copy fonts into theme** — `mkdir -p themes/minimal/static/fonts && cp static/fonts/*.woff2 themes/minimal/static/fonts/`. Low risk, no template changes. Verify site still builds.
- [x] **Step 2: Move contact layout to site level** — Copy `themes/minimal/layouts/contact/single.html` → `layouts/contact/single.html`, then delete from theme. Verify contact page still renders correctly.
- [x] **Step 3: Update `hugo.toml`** — Add menu entries, `socialLinks`, `homeCards`. Remove old individual social params (`github`, `linkedin`, `twitter`). Keep `email` and `twitterHandle`. This must happen **before** the template changes in steps 4-7, or the site will break.
- [x] **Step 4: Update header navigation** — Replace hardcoded links with menu loop in `themes/minimal/layouts/partials/header.html`.
- [x] **Step 5: Update homepage** — Replace hardcoded social links and cards with param-driven loops in `themes/minimal/layouts/index.html`.
- [x] **Step 6: Update footer** — Replace hardcoded social links with param-driven loop in `themes/minimal/layouts/partials/footer.html`.
- [x] **Step 7: Update JSON-LD** — Update `themes/minimal/layouts/partials/json-ld.html` to use `socialLinks` and configurable `@type`.
- [x] **Step 8: Verify** — Run `hugo server --buildDrafts`, check every page, inspect HTML source for correct meta tags and JSON-LD.

## Error Handling

| Scenario | Expected behavior |
|---|---|
| No `menus.main` defined | Empty nav (only theme toggle shows). No broken links. |
| No `socialLinks` defined | Homepage social links section hidden (`{{ with }}` guard). Footer social section hidden. |
| No `homeCards` defined | Homepage cards section hidden (`{{ with }}` guard). Hero + content still render. |
| No `email` defined | Footer mailto link hidden (`{{ with }}` guard). |
| No blog section exists | Footer "latest post" hidden (existing `{{ with }}` guard). RSS link hidden. |
| `socialLink` with relative URL (e.g. `/contact/`) | Renders fine in homepage/footer. Excluded from JSON-LD `sameAs` (filtered by `strings.HasPrefix .url "http"`). |
| `jsonLdType` not set | Defaults to `"Person"` — preserves current behavior. |
| `blogSection` not set | Defaults to `"blog"` — preserves current behavior. |

## Testing Strategy

1. **Build test** — Run `hugo` and confirm zero errors/warnings
2. **Dev server** — Run `hugo server --buildDrafts` and visually check:
   - Homepage: hero, social pills, cards all render with correct links
   - Navigation: all menu items present, active state works on each section
   - Footer: social icons render, email mailto works, RSS link works, latest post shows
   - Contact page: form still works (now from site-level layout)
   - 404 page: still renders
3. **HTML source inspection** — View source on:
   - Homepage: check JSON-LD has correct `@type` and `sameAs` array
   - Blog post: check JSON-LD `BlogPosting` is unchanged
   - Any page: check `<meta>` tags (og:*, twitter:*) are correct
4. **Empty config test** (optional) — Temporarily comment out `socialLinks`, `homeCards`, and `menus.main` from `hugo.toml` and verify the site still builds and renders gracefully with empty sections

## Decision Points

### Accepted approaches

1. **Hugo menus for navigation** — Standard Hugo pattern. Chosen over a custom `[[params.navLinks]]` array because Hugo menus have built-in active-state detection (`IsMenuCurrent`, `HasMenuCurrent`), section awareness, and weight-based ordering.

2. **Single `socialLinks` list for homepage + footer** — Reuse the same data source. Simpler than maintaining separate `homeSocialLinks` and `footerSocialLinks` arrays. The slight duplication (Contact pill appears in footer too) is acceptable.

3. **`email` as separate param** — Not folded into `socialLinks` because it's used in a `mailto:` context (footer) and also referenced by the contact form error message. Different semantics from a profile URL.

4. **Move contact layout vs. templatize it** — Chose to move it out of the theme entirely rather than making it configurable with params. The Cloudflare Turnstile integration is too hosting-specific; trying to abstract it would add complexity without real reuse value.

5. **Copy fonts (don't move)** — Fonts are added to the theme AND kept at site level. This avoids any risk of breakage. Hugo's static file merging handles precedence naturally.

### Rejected approaches

1. **Making the contact form configurable via params** (e.g. `params.contactFormAction`, `params.captchaProvider`) — Rejected because it would be over-engineering. Contact forms are inherently tied to backend infrastructure. Better to let each site define its own contact layout.

2. **Auto-generating home cards from `.Site.Sections`** — Rejected because section ordering and descriptions can't be derived automatically. Explicit config is clearer and more flexible.

3. **Separate social link lists for homepage vs footer** — Rejected to avoid config duplication. One list serves both. The only footer-specific addition is email (`mailto:`), handled separately.

4. **Moving fonts out of site `static/`** — Rejected. Keeping fonts in both locations is harmless and safer during the transition.

### Open but intentionally deferred

- `theme.toml` enrichment (min_version, author, tags, features)
- `exampleSite/` directory with sample content
- `README.md` for the theme
- Screenshots
- Hugo Modules support (`go.mod`)
- Data file schema documentation for resume/projects/quotes
- Placeholder favicons / OG image in theme

These are all about **publishing** the theme, not about separation of concerns. They can be done later.

## Future Enhancements

- **Parameterize favicons** — `head.html` hardcodes `/favicon-32x32.png` etc. Could be made configurable or bundled with the theme as generic defaults.
- **Default OG image** — `head.html` falls back to `/og-default.jpg`. Could be bundled with the theme or made optional.
- **Section-specific layouts** — The `resume/`, `projects/`, `quotes/` layouts assume specific YAML data schemas. Document these schemas so new users know what data files to create.
- **Configurable "Built with Hugo" footer text** — Currently hardcoded. Could be a param.

## Implementation Progress

All 8 steps completed successfully. Site builds with zero errors/warnings.

**Step 1:** Copied `bricolage-grotesque-latin.woff2` and `lexend-latin.woff2` into `themes/minimal/static/fonts/`. Site-level copies kept in place.

**Step 2:** Moved `themes/minimal/layouts/contact/single.html` → `layouts/contact/single.html`. Removed theme-level file and empty directory. Contact page still renders via site-level layout override.

**Step 3:** Updated `hugo.toml`: removed individual `github`, `linkedin`, `twitter` params. Added `[[params.socialLinks]]` (4 entries), `[[params.homeCards]]` (4 entries), and `[[menus.main]]` (5 entries). Kept `email` and `twitterHandle` as standalone params.

**Step 4:** Replaced hardcoded nav in `header.html` with Hugo menu loop. Added `hasPrefix` fallback alongside `IsMenuCurrent`/`HasMenuCurrent` for reliable active state detection on child pages (Hugo's built-in menu current detection doesn't work reliably with URL-based menu entries for section children).

**Step 5:** Replaced hardcoded social pills and home cards in `index.html` with `{{ with }}` guarded loops over `socialLinks` and `homeCards` params.

**Step 6:** Rewrote `footer.html` with param-driven social links, guarded email `mailto:`, configurable `blogSection` param (defaults to "blog"), and dynamic RSS link discovery.

**Step 7:** Updated `json-ld.html` to use `socialLinks` for `sameAs` (filtering to absolute URLs only), configurable `@type` via `jsonLdType` param (defaults to "Person"). Fixed potential leading-comma bug from old implementation.

**Step 8:** Verified full build (0 errors), checked HTML output for: homepage social pills with correct URLs, home cards rendering, JSON-LD with proper `sameAs` array, footer social icons + email + RSS, nav active states on blog posts and section pages, contact page rendering from site-level layout.
