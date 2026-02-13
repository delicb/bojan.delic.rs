---
date: 2026-02-13
title: "Phase 3: Layout Personality"
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies:
  - phase-2-typography
dependents: []
---

# Phase 3: Layout Personality — Hero, 404, Footer, Mobile

## Goal/Overview

Add personality and distinctive design touches to the site's key layout areas. This final phase transforms the site from "well-built minimal template" to "memorably designed personal brand." Changes involve both Hugo template modifications and CSS additions.

**Items addressed:**
- Hero section: decorative accent line, uppercase tagline treatment, pill-shaped social links
- 404 page: CSS-only glitch animation, playful copy
- Footer: gradient separator, social icon row, remove redundant RSS line
- Mobile nav: refined spacing/sizing, proper touch targets (no hamburger menu)

## Dependencies

- **Phase 1**: CSS keyframes (`fadeInUp`, `fadeIn`) and `prefers-reduced-motion` query are used here
- **Phase 2**: `--font-heading` custom property is referenced in new CSS rules

## File Structure

**Modified files only** (no new files):

| File | Changes |
|---|---|
| `themes/minimal/layouts/index.html` | Hero section redesign (accent line, social pill markup) |
| `themes/minimal/layouts/404.html` | Glitch effect 404 with updated copy |
| `themes/minimal/layouts/partials/footer.html` | Social icon row, remove RSS line |
| `themes/minimal/assets/css/layout.css` | Hero, 404, footer styles + glitch keyframes |
| `themes/minimal/assets/css/responsive.css` | Mobile nav, mobile hero, mobile 404, mobile footer, print overrides |

## Component Breakdown

### 1. Hero Section Redesign

**Template** — replace the hero `<section>` in `themes/minimal/layouts/index.html`. The rest of the file (home-sections, home-grid, .Content block) stays unchanged:

Current hero:
```html
<section class="hero">
  <h1>{{ .Site.Title }}</h1>
  <p class="tagline">{{ .Site.Params.tagline }}</p>

  <div class="social-links">
    <a href="{{ .Site.Params.github }}" title="GitHub">{{ partial "icon.html" (dict "name" "github") }} GitHub</a>
    <a href="{{ .Site.Params.linkedin }}" title="LinkedIn">{{ partial "icon.html" (dict "name" "linkedin") }} LinkedIn</a>
    <a href="{{ .Site.Params.twitter }}" title="X (Twitter)">{{ partial "icon.html" (dict "name" "x-twitter") }} X (Twitter)</a>
    <a href="/contact/" title="Contact">{{ partial "icon.html" (dict "name" "envelope") }} Contact</a>
  </div>
</section>
```

Replace with:
```html
<section class="hero">
  <div class="hero-accent" aria-hidden="true"></div>
  <h1>{{ .Site.Title }}</h1>
  <p class="tagline">{{ .Site.Params.tagline }}</p>

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
</section>
```

**CSS** — **replace** the entire `/* ---------- Hero (Home) ---------- */` section in `layout.css` (from the hero comment through `.social-links a:hover`):

```css
/* ---------- Hero (Home) ---------- */
.hero {
  text-align: center;
  padding: 5rem 0 3rem;
  position: relative;
  animation: fadeIn 0.5s ease both;
}

/* Decorative accent line above the name */
.hero-accent {
  width: 40px;
  height: 3px;
  background: var(--color-accent);
  margin: 0 auto 1.5rem;
  border-radius: 2px;
}

.hero h1 {
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.1s;
}

.tagline {
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.85rem;
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.2s;
}

/* Social links as pills */
.social-links {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.3s;
}

.social-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-family: var(--font-heading);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.social-pill:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-bg-secondary);
}
```

**Remove** the old `.social-links a` and `.social-links a:hover` rules — they're replaced by `.social-pill`.

**Design notes:**
- `.hero-accent` is a 40×3px green bar centered above the name — subtle visual anchor
- Tagline gets `text-transform: uppercase` + wide `letter-spacing` for editorial/magazine feel at smaller size
- Social links become pill buttons (border + rounded ends) — more visual weight, better touch targets
- Social text shortened: "X (Twitter)" → "X", etc. Icon provides context.

### 2. 404 Page — Glitch Effect

**Template** — replace entire content of `themes/minimal/layouts/404.html`:

```html
{{ define "main" }}
<section class="page-404">
  <div class="glitch-wrapper" aria-hidden="true">
    <span class="glitch-text" data-text="404">404</span>
  </div>
  <p>You've wandered into the void. This page doesn't exist.</p>
  <p class="page-404-suggestion">Maybe it moved, maybe it never was. Either way:</p>
  <a href="/" class="back-home">&larr; Head back home</a>
</section>
{{ end }}
```

**CSS** — **replace** the entire `/* ---------- 404 ---------- */` section in `layout.css`:

```css
/* ---------- 404 ---------- */
.page-404 {
  text-align: center;
  padding: 6rem 0;
  animation: fadeIn 0.5s ease both;
}

.glitch-wrapper {
  margin-bottom: 1.5rem;
}

.glitch-text {
  font-family: var(--font-heading);
  font-size: 8rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-text-secondary);
  position: relative;
  display: inline-block;
}

/* Subtle glitch via pseudo-elements + clip-path */
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.glitch-text::before {
  color: var(--color-accent);
  animation: glitch-1 3s infinite linear alternate-reverse;
  clip-path: inset(0 0 65% 0);
}

.glitch-text::after {
  color: var(--color-text-secondary);
  animation: glitch-2 3s infinite linear alternate-reverse;
  clip-path: inset(65% 0 0 0);
}

@keyframes glitch-1 {
  0%, 90% { transform: translate(0); }
  92% { transform: translate(-3px, 1px); }
  94% { transform: translate(2px, -1px); }
  96% { transform: translate(-1px, 2px); }
  98% { transform: translate(3px, 0); }
  100% { transform: translate(0); }
}

@keyframes glitch-2 {
  0%, 90% { transform: translate(0); }
  91% { transform: translate(2px, 1px); }
  93% { transform: translate(-3px, -1px); }
  95% { transform: translate(1px, 2px); }
  97% { transform: translate(-2px, 0); }
  100% { transform: translate(0); }
}

.page-404 p {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.page-404 .page-404-suggestion {
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.page-404 .back-home {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  color: var(--color-link);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: color 0.2s, border-color 0.2s;
}

.page-404 .back-home:hover {
  color: var(--color-link-hover);
  border-color: var(--color-accent);
}
```

**Design notes:**
- Glitch effect is 90% static — only tiny shifts in the last 10% of the 3s cycle. Subtle, not distracting.
- `clip-path: inset()` splits the "404" into top/bottom halves that shift independently
- Accent color peeks through the `::before` layer, tying to site identity
- `data-text="404"` attribute drives `attr()` in CSS — pure CSS, no JS
- Back-home link gets button-like treatment (border + padding + radius)

### 3. Footer Elevation

**Template** — replace entire content of `themes/minimal/layouts/partials/footer.html`:

Current:
```html
<footer class="site-footer">
  <div class="container">
    <p>&copy; {{ now.Year }} {{ .Site.Title }}. Built with <a href="https://gohugo.io">Hugo</a>.</p>
    <p class="footer-rss"><a href="/blog/index.xml" title="RSS Feed">{{ partial "icon.html" (dict "name" "rss") }} RSS</a></p>
  </div>
</footer>
```

Replace with:
```html
<footer class="site-footer">
  <div class="container">
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

**CSS** — **replace** the entire `/* ---------- Footer ---------- */` section in `layout.css`. Also **delete** the old `.footer-rss`, `.footer-rss a`, and `.footer-rss a:hover` rules:

```css
/* ---------- Footer ---------- */
.site-footer {
  padding: 2.5rem 0 2rem;
  margin-top: 3rem;
  position: relative;
}

/* Gradient separator instead of plain border-top */
.site-footer::before {
  content: "";
  display: block;
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-border) 20%,
    var(--color-accent) 50%,
    var(--color-border) 80%,
    transparent
  );
  margin-bottom: 2.5rem;
}

.footer-social {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
  margin-bottom: 1rem;
}

.footer-social a {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  transition: color 0.2s, transform 0.2s;
}

.footer-social a:hover {
  color: var(--color-accent);
  transform: translateY(-1px);
}

.site-footer p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.site-footer p a {
  color: var(--color-link);
  text-decoration: underline;
}
```

**Changes from current:**
- `border-top: 1px solid` → gradient `::before` that fades transparent → border → accent → border → transparent
- RSS link merged into icon row (no longer a separate text line)
- Social icons get subtle -1px lift on hover
- Email link added (`mailto:` using `.Site.Params.email`)
- Old `.footer-rss` class and its rules are completely removed

### 4. Mobile Nav Refinements

**Replace** the entire `@media (max-width: 600px)` block in `themes/minimal/assets/css/responsive.css`:

```css
@media (max-width: 600px) {
  /* Header: title + toggle on first row, nav wraps below */
  .site-header .container {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .site-nav {
    gap: 0.6rem;
    width: 100%;
    justify-content: center;
    order: 2;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border);
  }

  .site-nav a {
    font-size: 0.82rem;
    padding: 0.25rem 0;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .theme-toggle {
    order: 1;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .hero h1 {
    font-size: 1.8rem;
  }

  .tagline {
    font-size: 0.75rem;
    letter-spacing: 0.03em;
  }

  .social-pill {
    font-size: 0.8rem;
    padding: 0.35rem 0.7rem;
  }

  .home-grid {
    grid-template-columns: 1fr;
  }

  .post-item > a {
    flex-direction: column;
    gap: 0.2rem;
  }

  .article-header h1 {
    font-size: 1.5rem;
  }

  .glitch-text {
    font-size: 5rem;
  }

  .footer-social {
    gap: 1rem;
  }
}
```

**Key changes from current mobile styles:**
- Header stays horizontal — title on left, theme toggle on right (both `order` controlled)
- Nav wraps to second row with a subtle `border-top` separator
- All interactive elements get `min-height: 44px` (WCAG / Apple HIG touch target)
- Nav font reduced to 0.82rem, gap to 0.6rem to fit 5 links
- New elements (social pills, glitch text, footer social) get mobile sizes

### 5. Print Style Additions

**Add** inside the existing `@media print` block in `responsive.css`:

```css
/* Hide Phase 3 decorative elements in print */
.hero-accent,
.footer-social,
.site-footer::before {
  display: none !important;
}

.glitch-text::before,
.glitch-text::after {
  display: none !important;
}
```

## Integration Points

- **Hero template change** modifies `index.html` markup — old `.social-links a` CSS must be removed and replaced by `.social-pill` CSS. Don't leave orphaned rules.
- **Footer template** removes the `.footer-rss` paragraph entirely. Delete corresponding CSS rules (`.footer-rss`, `.footer-rss a`, `.footer-rss a:hover`) from `layout.css`.
- **Glitch keyframes** (`glitch-1`, `glitch-2`) are defined in `layout.css`, separate from the `fadeInUp`/`fadeIn` keyframes in `base.css` (from Phase 1). Both are available site-wide because Hugo Pipes concatenates all CSS.
- **`data-text` attribute** on `.glitch-text` is consumed by CSS `attr()` — no JS involved.
- **Social pills** reference `--font-heading` from Phase 2. If Phase 2 isn't done yet, they'll fall back to the inherited font (still functional, just not as refined).
- All icons used in the new footer (`github`, `linkedin`, `x-twitter`, `envelope`, `rss`) already exist in `themes/minimal/assets/icons/`.
- The `prefers-reduced-motion` media query from Phase 1 automatically disables all glitch and entrance animations.

## Implementation Order

- [x] 1. Update hero template in `themes/minimal/layouts/index.html`
- [x] 2. Replace hero CSS in `themes/minimal/assets/css/layout.css` (hero section + social-pill + remove old `.social-links a`)
- [x] 3. Update 404 template in `themes/minimal/layouts/404.html`
- [x] 4. Replace 404 CSS in `themes/minimal/assets/css/layout.css` (page-404 section + glitch keyframes)
- [x] 5. Update footer template in `themes/minimal/layouts/partials/footer.html`
- [x] 6. Replace footer CSS in `themes/minimal/assets/css/layout.css` (footer section); delete `.footer-rss` rules
- [x] 7. Replace mobile styles in `themes/minimal/assets/css/responsive.css`
- [x] 8. Add print overrides for new elements in `themes/minimal/assets/css/responsive.css`
- [x] 9. Verify with `hugo server --buildDrafts`

## Error Handling

- **Glitch + reduced motion**: Phase 1's `prefers-reduced-motion` rule makes glitch static automatically.
- **Social pills overflow on tiny screens**: `flex-wrap: wrap` ensures pills wrap at <320px.
- **Footer gradient in high-contrast mode**: The gradient uses `var(--color-border)` and `var(--color-accent)` which are already defined for both themes. In forced-colors mode, the `::before` may be invisible — acceptable since it's decorative.
- **Missing Phase 2 fonts**: Social pills declare `font-family: var(--font-heading)`. If `--font-heading` isn't defined (Phase 2 skipped), it inherits from `body` — degraded but functional.

## Testing Strategy

1. `hugo server --buildDrafts`
2. **Hero**: Green accent line above name, uppercase small tagline, pill-shaped social links with hover border+color change
3. **404**: Navigate to `/nonexistent/` — "404" displays with subtle glitch (mostly static, small shifts every ~3s), playful copy, button-style back link
4. **Footer**: Gradient separator (green accent center), 5 icon-only social links in a row, hover shows accent color + lift
5. **Mobile 375px** (DevTools): Title left + toggle right, nav wraps below with border separator, pills fit, 404 text = 5rem
6. **Mobile 320px**: Nothing overflows, all interactive elements ≥44px tall
7. **Dark mode**: All new elements correct — gradient separator visible, glitch accent color matches dark accent, pill borders use dark border color
8. **Reduced motion**: Glitch is completely static, no entrance animations
9. **Accessibility**: Tab through hero pills → footer icons — focus visible and logical order
10. **Print**: Hero accent, footer social row, gradient separator all hidden

## Decision Points

| Decision | Choice | Why |
|---|---|---|
| Hero decoration | 40px accent line | Subtle, ties to accent color, doesn't compete with name |
| Tagline treatment | Uppercase + letter-spacing | Editorial feel; subtitle rather than plain sentence |
| Social links | Pill buttons | More visual weight, better touch targets than plain text |
| 404 effect | CSS-only glitch | Playful, professional, mostly static; no JS |
| Footer separator | Gradient with accent center | More distinctive than plain border; subtle accent integration |
| Footer social | Icon-only row | Compact; text labels redundant (title attrs provide a11y) |
| Mobile nav | Wrap below title (no hamburger) | User explicitly rejected hamburger menu |
| Hamburger menu | **Rejected** | User decision: "Lets go without hamburger menu, just refine spacing/sizing" |
| Code copy button | **Deferred** | User decision: "Lets skip copy button for now" |

## Future Enhancements

- Hero: subtle CSS gradient mesh background at low opacity
- Hero: monogram/initials "BD" as decorative mark
- Footer: "Latest post" mini-preview
- Back-to-top button for long articles (requires JS for smooth scroll)
- Code copy button (deferred from this project scope)

## Implementation Progress

All 9 steps completed successfully. Hugo build passes with no errors (73ms, 31 pages).

**Changes made:**
1. **Hero** (`index.html` + `layout.css`): Added decorative accent line, uppercase tagline, pill-shaped social links replacing plain text links. Removed old `.social-links a` rules.
2. **404** (`404.html` + `layout.css`): CSS-only glitch effect with `clip-path` + pseudo-elements, playful copy, button-styled back link. Added `glitch-1`/`glitch-2` keyframes.
3. **Footer** (`footer.html` + `layout.css`): Gradient separator via `::before`, icon-only social row (GitHub, LinkedIn, X, Email, RSS), removed `.footer-rss` class and rules. Email uses existing `email` param from `hugo.toml`.
4. **Mobile** (`responsive.css`): Header stays horizontal with nav wrapping below, 44px min touch targets, mobile sizes for pills/glitch/footer.
5. **Print** (`responsive.css`): Hide decorative elements (accent line, footer social, gradient separator, glitch pseudo-elements).
