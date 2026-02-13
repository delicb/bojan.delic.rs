---
date: 2026-02-13
title: "Phase 2: Typography"
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies:
  - phase-1-css-polish
dependents:
  - phase-3-layout-personality
---

# Phase 2: Typography — Distinctive Font Pairing via Google Fonts

## Goal/Overview

Replace the generic system font stack with a distinctive font pairing that gives the site a memorable typographic identity. This is the single highest-impact design change — the current `--font-body` uses `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...` which is indistinguishable from thousands of other developer sites.

**Current state**: No custom fonts loaded. No `@font-face`. No font files in the project. All text uses system fonts.

**Target state**: Two Google Fonts loaded via CDN — **Bricolage Grotesque** for headings and UI, **Source Serif 4** for body text. Applied via new `--font-heading` CSS custom property and updated `--font-body`.

## Dependencies

- **Phase 1** must be completed first (animations/transitions interact with font rendering)
- **Google Fonts CDN** — external `<link>` tags (user explicitly chose CDN over self-hosting)

## File Structure

**Modified files only** (no new files):

| File | Changes |
|---|---|
| `themes/minimal/layouts/partials/head.html` | Add Google Fonts `<link>` preconnect + stylesheet |
| `themes/minimal/assets/css/base.css` | Add `--font-heading` token, update `--font-body` to serif, add global heading rule |
| `themes/minimal/assets/css/layout.css` | Apply `--font-heading` to headings/UI elements, adjust font sizes |
| `themes/minimal/assets/css/article.css` | Apply `--font-heading` to article headings, add letter-spacing to body |
| `themes/minimal/assets/css/sections.css` | Apply `--font-heading` to section headings |
| `themes/minimal/assets/css/responsive.css` | Print font overrides |

## Component Breakdown

### 1. Font Selection Rationale

**Heading font: Bricolage Grotesque** (variable, 200–800 weight)
- Distinctive geometric-grotesque with personality and optical sizing
- Not overused in developer blogs (unlike Inter, Space Grotesk)
- Variable font — single file covers all weights
- Google Fonts URL: `family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700`

**Body font: Source Serif 4** (variable, 200–900 weight)
- Excellent screen reading serif with wide language support
- Serif body + grotesque headings creates editorial contrast
- Variable font with optical sizing
- Google Fonts URL: `family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400`

**Rejected alternatives and why:**
- **Playfair Display**: Beautiful but heavy download, overused
- **Fraunces**: Very distinctive but quirky optical sizing might clash with minimal aesthetic
- **Newsreader**: Good but less distinctive than Bricolage + Source Serif
- **IBM Plex Sans**: Too safe/corporate for differentiation
- **Literata**: Solid but Source Serif 4 has better variable font support
- **Inter / Space Grotesk / Roboto**: Explicitly flagged as "generic AI aesthetics" to avoid

**Mono font**: Keep existing `--font-mono` unchanged (JetBrains Mono / Fira Code / SF Mono stack).

### 2. Google Fonts Loading — `head.html`

Add **after** the `{{ partial "json-ld.html" . }}` line and **before** the `{{/* Styles */}}` comment:

```html
{{/* Fonts */}}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
```

Key details:
- `preconnect` to both domains for fastest loading
- `display=swap` — text visible immediately in fallback, swaps when font loads
- Only weights actually used: 400/700 for headings, 400/600/italic-400 for body

### 3. CSS Custom Property Updates — `base.css`

**Replace** the `--font-body` line in the `:root` block and **add** `--font-heading`:

```css
:root {
  --font-heading: "Bricolage Grotesque", -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  --font-body: "Source Serif 4", Georgia, "Times New Roman", serif;
  --font-mono: "JetBrains Mono", "Fira Code", "SF Mono", Menlo, Consolas,
    monospace;
  /* ...all color tokens unchanged... */
}
```

Note the `--font-body` fallback changes from sans-serif to serif stack (`Georgia, "Times New Roman", serif`) since Source Serif 4 is a serif font. Georgia has similar x-height metrics, minimizing layout shift during font swap.

### 4. Global Heading Rule — `base.css`

Add after the `body` rule in the Base section:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

This provides the default; specific selectors in other files override where needed.

### 5. Layout Typography — `layout.css`

Apply `--font-heading` explicitly to UI elements (nav, tags, meta text) so they use the sans-serif font, not the serif body font. **Add `font-family` to these existing rules** (don't replace other properties):

```css
.site-title {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}

.site-nav a {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}

.hero h1 {
  font-size: 2.4rem;  /* was 2.5rem — Bricolage runs slightly wider */
  /* ...rest unchanged... */
}

.tagline {
  font-family: var(--font-body);  /* explicit — stays serif */
  /* ...rest unchanged... */
}

.social-links a {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}

.home-card h2 {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}

.page-header h1 {
  font-size: 1.9rem;  /* was 2rem — slight reduction for Bricolage */
  /* ...rest unchanged... */
}

.post-date,
.post-reading-time {
  font-family: var(--font-heading);
}

.pagination a,
.pagination-info {
  font-family: var(--font-heading);
}
```

### 6. Article Typography — `article.css`

```css
.article-header h1 {
  font-size: 1.9rem;  /* was 2rem */
  /* ...rest unchanged... */
}

.article-date,
.article-reading-time {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}

.article-content {
  font-size: 1.05rem;
  line-height: 1.8;
  letter-spacing: 0.005em;  /* new — Source Serif 4 benefits from slight spacing */
}

.article-content h2 {
  font-size: 1.45rem;  /* was 1.5rem */
  /* ...rest unchanged... */
}

.article-content h3 {
  font-size: 1.15rem;  /* was 1.2rem */
  /* ...rest unchanged... */
}

.tag {
  font-family: var(--font-heading);
  /* ...rest unchanged... */
}
```

### 7. Section Typography — `sections.css`

Add `font-family: var(--font-heading);` to these existing rules:

```css
.resume-section h2 { font-family: var(--font-heading); }
.resume-company-header h3 { font-family: var(--font-heading); }
.resume-role-header h4 { font-family: var(--font-heading); }
.project-card-featured h3 { font-family: var(--font-heading); }
.project-section-heading { font-family: var(--font-heading); }
.project-list-name { font-family: var(--font-heading); }
```

Note: The global `h1-h6` rule in `base.css` already handles most of these, but being explicit prevents issues if the global rule is ever removed and documents the intent.

### 8. Print Font Overrides — `responsive.css`

Add inside the existing `@media print` block (near the top where `:root` is overridden):

```css
@media print {
  :root {
    --font-heading: Georgia, serif;
    --font-body: Georgia, serif;
    /* ...existing print color overrides remain... */
  }
  /* ...rest of print styles... */
}
```

This ensures print output doesn't depend on Google Fonts CDN.

## Integration Points

- `--font-heading` is a **new** CSS custom property — it doesn't exist in the current codebase. All headings currently inherit `--font-body` from `body`.
- The Google Fonts `<link>` in `head.html` is the only external CDN reference. The project currently loads no external resources (icons are self-hosted SVGs, no JS CDNs).
- `display=swap` causes a FOIT→FOUT (flash of unstyled text → fallback font → custom font). Georgia is chosen as the serif fallback specifically because its metrics are close to Source Serif 4.
- The global `h1-h6` rule in `base.css` interacts with the specific heading selectors in layout/article/sections — specificity is fine since the specific selectors have higher specificity than element selectors.

## Implementation Order

- [x] 1. Add Google Fonts `<link>` tags to `themes/minimal/layouts/partials/head.html`
- [x] 2. Add `--font-heading` and update `--font-body` in `:root` in `themes/minimal/assets/css/base.css`
- [x] 3. Add global `h1-h6 { font-family: var(--font-heading) }` in `themes/minimal/assets/css/base.css`
- [x] 4. Update layout headings/UI in `themes/minimal/assets/css/layout.css`
- [x] 5. Update article headings/meta in `themes/minimal/assets/css/article.css`
- [x] 6. Update section headings in `themes/minimal/assets/css/sections.css`
- [x] 7. Update print styles in `themes/minimal/assets/css/responsive.css`
- [x] 8. Verify with `hugo server --buildDrafts`

## Error Handling

- **Google Fonts CDN unavailable**: CSS fallback stacks ensure readability. `--font-heading` → system sans-serif. `--font-body` → Georgia → Times New Roman → serif.
- **Font loading delay**: `display=swap` shows fallback immediately. Layout shift is minimized by choosing Georgia (similar x-height to Source Serif 4).
- **Variable font axis (`opsz`) not supported**: Font still renders correctly — just without size-specific optical adjustments. No visual breakage.

## Testing Strategy

1. `hugo server --buildDrafts`
2. **Home page**: "Bojan Delić" in Bricolage Grotesque (geometric sans), tagline in Source Serif 4 (serif), card descriptions in Source Serif 4
3. **Blog list**: Post titles in Bricolage, dates/reading-time in Bricolage (sans UI text)
4. **Blog post**: Title in Bricolage, body in Source Serif 4 (serif), inline code in JetBrains Mono, code blocks in JetBrains Mono
5. **Resume**: Section headings (Skills, Experience, Education) in Bricolage, body descriptions in Source Serif 4
6. **DevTools → Network tab**: Verify 2 woff2 font requests, combined <100KB
7. **Throttled load** (Network: Slow 3G): Text appears immediately in Georgia/system font, then swaps to custom fonts
8. **Print preview**: Georgia used everywhere (no external font dependency)
9. **Font stacking test**: Block `fonts.googleapis.com` in DevTools → verify fallback fonts render acceptably

## Decision Points

| Decision | Choice | Why |
|---|---|---|
| Font pairing | Bricolage Grotesque + Lexend | Distinctive heading font + readable body font designed for reading fluency; owner tried Source Serif 4, DM Sans, Outfit, Karla, Source Sans 3 — Lexend was the clear winner |
| Loading method | Google Fonts CDN | User explicitly chose CDN; self-hosting is a future enhancement |
| Loading strategy | `display=swap` | Standard; avoids invisible text during load |
| UI text font | `--font-heading` (sans) | Sans-serif is better for small text: nav, tags, dates, pagination |
| Body font fallback | System sans-serif stack | Lexend is sans-serif; system fonts are adequate fallback |
| Font sizes | Reduced 0.05–0.1rem for headings | Bricolage renders slightly wider than system fonts at same size |
| Print fonts | System sans-serif | No CDN dependency in print |

## Future Enhancements

- Self-host WOFF2 files (download from Google Fonts, `@font-face` in `base.css`, files in `static/fonts/`) — aligns with "no external CDN" principle
- Add `<link rel="preload">` for the heading font woff2 to reduce swap delay
- Subset fonts to Latin-only if no multilingual content needed
- Consider `font-display: optional` for slow connections (eliminates swap entirely, but font may not show)

## Implementation Progress

All 8 steps completed successfully. Changes made:

1. **head.html**: Added preconnect links to `fonts.googleapis.com` and `fonts.gstatic.com`, plus the Google Fonts stylesheet link loading Bricolage Grotesque (400, 700) and Source Serif 4 (400, 600, italic 400) with `display=swap`.
2. **base.css**: Added `--font-heading` custom property with Bricolage Grotesque + system sans fallbacks. Changed `--font-body` from system sans stack to Source Serif 4 + Georgia/serif fallbacks. Added global `h1-h6` rule with `font-family: var(--font-heading)`.
3. **layout.css**: Applied `--font-heading` to `.site-title`, `.site-nav a`, `.social-links a`, `.home-card h2`, `.post-date`, `.post-reading-time`, `.pagination a`, `.pagination-info`. Reduced `.hero h1` from 2.5rem to 2.4rem, `.page-header h1` from 2rem to 1.9rem. Added explicit `--font-body` to `.tagline`.
4. **article.css**: Reduced `.article-header h1` from 2rem to 1.9rem, `.article-content h2` from 1.5rem to 1.45rem, `.article-content h3` from 1.2rem to 1.15rem. Applied `--font-heading` to `.article-date`, `.article-reading-time`, `.tag`. Added `letter-spacing: 0.005em` to `.article-content`.
5. **sections.css**: Applied `--font-heading` to `.resume-section h2`, `.resume-company-header h3`, `.resume-role-header h4`, `.project-card-featured h3`, `.project-section-heading`, `.project-list-name`.
6. **responsive.css**: Added `--font-heading: Georgia, serif` and `--font-body: Georgia, serif` to the `@media print` `:root` override.
7. **Build verification**: `hugo` completed in 63ms with no errors. Google Fonts links confirmed in output HTML.

**Post-implementation**: Owner reviewed Source Serif 4 and didn't like serif for body text. Tried DM Sans, Outfit, Karla, and Source Sans 3 — all looked too similar to system fonts. Switched to **Lexend** (designed for reading fluency, noticeably wider spacing) which was the clear winner. Updated `--font-body`, Google Fonts link, print fallbacks, and removed serif-specific `letter-spacing` adjustment.
