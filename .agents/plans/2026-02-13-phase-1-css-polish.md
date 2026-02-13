---
date: 2026-02-13
title: "Phase 1: CSS Polish"
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents:
  - phase-2-typography
---

# Phase 1: CSS Polish — Animations, Hover Effects & Visual Refinements

## Goal/Overview

Add visual polish to the existing Hugo personal website through **primarily CSS-only changes**. The site (bojan.delic.rs) is a minimalist personal site built with Hugo and a custom theme at `themes/minimal/`. It's technically well-built but visually flat — no animations, minimal hover feedback, no visual indicator for active navigation, and jarring instant theme switching.

This phase makes the existing design feel more alive and intentional through micro-interactions, page load animations, and stronger accent color application — without changing fonts, templates (except one small nav fix), or the overall layout.

**Items addressed:**
- Page load animations (fade-in + staggered reveals)
- Home card hover micro-interactions (lift + shadow)
- Bolder accent color application (body top border, HR styling)
- Active navigation indicator
- Blog post list visual hierarchy improvements
- Smooth dark/light mode transitions

## Dependencies

None. Pure CSS changes plus one small Hugo template conditional for active nav.

## File Structure

**Modified files only** (no new files created):

| File (relative to project root) | Changes |
|---|---|
| `themes/minimal/assets/css/base.css` | Add `@keyframes`, body accent border, dark mode transition properties, `.no-transition` suppressor |
| `themes/minimal/assets/css/layout.css` | Home card hover effects + stagger, hero animation, active nav styles, post list refinements |
| `themes/minimal/assets/css/article.css` | Article header staggered entrance, HR accent color |
| `themes/minimal/assets/css/responsive.css` | `prefers-reduced-motion` media query |
| `themes/minimal/layouts/partials/header.html` | Add `active` class to current section's nav link |
| `themes/minimal/layouts/partials/head.html` | Extend inline theme-restore script with `.no-transition` logic |

## Component Breakdown

### 1. Keyframe Definitions — `base.css`

Add **before** the `/* ---------- Inline SVG Icons ---------- */` section at the end of the file:

```css
/* ---------- Animations ---------- */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

These keyframes are reused across layout.css and article.css. Only `transform` and `opacity` are animated (GPU-composited, no layout thrashing).

### 2. Body Accent Border — `base.css`

Add to the existing `body` rule:

```css
body {
  /* ...existing properties unchanged... */
  border-top: 3px solid var(--color-accent);
}
```

This is a classic editorial touch — a thin colored stripe at the very top of the viewport that ties to the site's green accent color.

### 3. Dark Mode Smooth Transitions — `base.css` + `head.html`

**Problem**: When the user clicks the theme toggle, all colors change instantly, which is jarring.

**Solution**: Add CSS transitions on key elements, but suppress them during initial page load (to prevent a flash when the saved theme is applied from localStorage).

**In `base.css`**, add after the Theme Toggle section:

```css
/* ---------- Theme Transitions ---------- */
body,
.site-header,
.site-footer,
.home-card,
.post-item,
.article-content {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Suppress transitions during initial page load */
.no-transition *,
.no-transition *::before,
.no-transition *::after {
  transition: none !important;
}
```

**In `themes/minimal/layouts/partials/head.html`**, replace the existing inline `<script>` block (the last element in the file):

Current:
```js
<script>
  // Apply saved theme immediately to prevent flash
  (function() {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

Replace with:
```js
<script>
  // Apply saved theme immediately to prevent flash
  (function() {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    // Suppress transitions during initial paint, then enable
    document.documentElement.classList.add('no-transition');
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        document.documentElement.classList.remove('no-transition');
      });
    });
  })();
</script>
```

The double-`requestAnimationFrame` ensures the browser has painted the initial state before enabling transitions. This prevents the theme-restore from triggering a visible color transition on page load.

### 4. Home Card Hover Effects + Stagger — `layout.css`

**Replace** the existing `.home-card` transition and `.home-card:hover` rules:

```css
.home-card {
  display: block;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card-bg);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.2s ease, box-shadow 0.2s ease;
  /* Staggered page load animation */
  animation: fadeInUp 0.4s ease both;
}

.home-card:nth-child(1) { animation-delay: 0.05s; }
.home-card:nth-child(2) { animation-delay: 0.1s; }
.home-card:nth-child(3) { animation-delay: 0.15s; }
.home-card:nth-child(4) { animation-delay: 0.2s; }

.home-card:hover {
  background: var(--color-card-hover);
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

**Add dark mode shadow override**. Place after the `.home-card:hover` rule:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .home-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
[data-theme="dark"] .home-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

This follows the existing triple-selector pattern used throughout `base.css` and `syntax.css` for theme-specific overrides (auto dark via `@media`, manual dark via `[data-theme="dark"]`).

### 5. Hero Animation — `layout.css`

**Add** animation properties to the existing hero rules (don't replace — just add the `animation` lines):

```css
.hero {
  /* ...existing properties... */
  animation: fadeIn 0.5s ease both;
}

.hero h1 {
  /* ...existing properties... */
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.1s;
}
```

**Update** `.tagline` and `.social-links` (add animation to existing rules):

```css
.tagline {
  /* ...existing properties... */
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.2s;
}

.social-links {
  /* ...existing properties... */
  animation: fadeInUp 0.5s ease both;
  animation-delay: 0.3s;
}
```

### 6. Active Nav Indicator — `header.html` + `layout.css`

**Template** — replace the full content of `themes/minimal/layouts/partials/header.html`:

```html
<header class="site-header">
  <div class="container">
    <a href="{{ .Site.BaseURL }}" class="site-title">{{ .Site.Title }}</a>
    <nav class="site-nav">
      <a href="/blog/"{{ if hasPrefix .RelPermalink "/blog/" }} class="active"{{ end }}>Blog</a>
      <a href="/resume/"{{ if hasPrefix .RelPermalink "/resume/" }} class="active"{{ end }}>Resume</a>
      <a href="/projects/"{{ if hasPrefix .RelPermalink "/projects/" }} class="active"{{ end }}>Projects</a>
      <a href="/quotes/"{{ if hasPrefix .RelPermalink "/quotes/" }} class="active"{{ end }}>Quotes</a>
      <a href="/contact/"{{ if hasPrefix .RelPermalink "/contact/" }} class="active"{{ end }}>Contact</a>
      <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark/light mode">
        <span class="icon-sun">☀️</span>
        <span class="icon-moon">🌙</span>
      </button>
    </nav>
  </div>
</header>
```

Hugo's `hasPrefix` on `.RelPermalink` matches both the section index and any child pages (e.g., `/blog/` and `/blog/2024/01/my-post/`).

**CSS** — add after `.site-nav a:hover` in `layout.css`:

```css
.site-nav a.active {
  color: var(--color-accent);
  font-weight: 600;
}
```

### 7. Blog Post List Refinements — `layout.css`

**Update** the existing `.post-title` rule (change font-size):

```css
.post-title {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--color-text);
  transition: color 0.2s;
}
```

**Update** existing `.post-item` and add hover rule:

```css
.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
  transition: padding-left 0.2s ease;
}

.post-item:hover {
  padding-left: 0.5rem;
}
```

### 8. Article Header Stagger — `article.css`

**Add** animation properties to existing rules:

```css
.article-header h1 {
  /* ...existing properties... */
  animation: fadeInUp 0.4s ease both;
  animation-delay: 0.1s;
}

.article-date,
.article-reading-time {
  /* ...existing properties... */
  animation: fadeIn 0.4s ease both;
  animation-delay: 0.25s;
}

.article-tags {
  /* ...existing properties... */
  animation: fadeIn 0.4s ease both;
  animation-delay: 0.35s;
}
```

### 9. HR Accent Color — `article.css`

**Replace** the existing `.article-content hr` rule:

```css
.article-content hr {
  border: none;
  border-top: 2px solid var(--color-accent);
  margin: 2.5rem 0;
}
```

Was: `1px solid var(--color-border)` with `margin: 2rem 0`. Now uses accent color and slightly more breathing room.

### 10. Reduced Motion — `responsive.css`

**Add** before the `@media print` block:

```css
/* ---------- Reduced Motion ---------- */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This respects the OS-level "Reduce motion" accessibility setting. All animations and transitions are effectively disabled.

### 11. Print: Hide Body Accent Border — `responsive.css`

**Add** inside the existing `@media print` block:

```css
body {
  border-top: none;
}
```

## Integration Points

- All CSS changes go into existing files following their established section comment structure (`/* ---------- Section ---------- */`)
- The `header.html` change uses Hugo's built-in `hasPrefix` function — no custom logic or partials needed
- The `head.html` script change extends the existing inline theme-restore script — keep it inline, don't create a separate JS file
- Dark mode shadow overrides follow the same selector pattern already used in `base.css` (lines 35-62) and extensively in `syntax.css`
- The `@keyframes` in `base.css` are referenced by selectors in `layout.css` and `article.css` — this works because Hugo Pipes concatenates all CSS files into one output file (see `head.html` lines 55-60)

## Implementation Order

- [x] 1. Add `@keyframes fadeInUp` and `@keyframes fadeIn` to `themes/minimal/assets/css/base.css`
- [x] 2. Add `body { border-top: 3px solid var(--color-accent); }` to `themes/minimal/assets/css/base.css`
- [x] 3. Add theme transition CSS + `.no-transition` suppressor to `themes/minimal/assets/css/base.css`
- [x] 4. Update the inline `<script>` in `themes/minimal/layouts/partials/head.html` to add/remove `.no-transition`
- [x] 5. Add hero animation delays to `.hero`, `.hero h1`, `.tagline`, `.social-links` in `themes/minimal/assets/css/layout.css`
- [x] 6. Update `.home-card` with enhanced hover + staggered animation in `themes/minimal/assets/css/layout.css`
- [x] 7. Add dark mode shadow override for `.home-card:hover` in `themes/minimal/assets/css/layout.css`
- [x] 8. Update `themes/minimal/layouts/partials/header.html` with active nav class conditionals
- [x] 9. Add `.site-nav a.active` styles to `themes/minimal/assets/css/layout.css`
- [x] 10. Update `.post-title` font-size and `.post-item` hover indent in `themes/minimal/assets/css/layout.css`
- [x] 11. Add article header staggered animations to `themes/minimal/assets/css/article.css`
- [x] 12. Update `hr` styling in `themes/minimal/assets/css/article.css`
- [x] 13. Add `prefers-reduced-motion` media query to `themes/minimal/assets/css/responsive.css`
- [x] 14. Add `body { border-top: none; }` to `@media print` in `themes/minimal/assets/css/responsive.css`
- [x] 15. Verify with `hugo server --buildDrafts`

## Error Handling

- **Flash of wrong theme on load**: The `.no-transition` class + double-rAF prevents jarring transitions. If `requestAnimationFrame` is unavailable (very old browsers), the fallback is the same as current behavior (instant switch, no regression).
- **Animation performance**: All animations use only `transform` and `opacity` (GPU-composited). No width/height/layout animations.
- **Dark mode shadow selectors**: Must handle three cases following existing pattern: (a) auto dark via `@media (prefers-color-scheme: dark)`, (b) manual dark via `[data-theme="dark"]`, (c) implicit light (no attribute). See `base.css` lines 35-62 for the exact pattern to follow.

## Testing Strategy

1. `hugo server --buildDrafts`
2. **Home page**: Hero fades in with staggered children (h1 → tagline → social links). Cards stagger in (0.05s increments). Cards lift + shadow on hover.
3. **Navigation**: Click through Blog, Resume, Projects, Quotes, Contact — active link shows in accent color with font-weight 600. Home page should have NO active nav link.
4. **Blog list**: Hover over post items — subtle 0.5rem left indent animation. Post titles slightly larger (1.05rem).
5. **Blog post**: Title/date/tags animate in sequence. `<hr>` elements use accent color (2px).
6. **Theme toggle**: Click toggle — colors transition smoothly over 0.3s. Toggle rapidly — no glitches.
7. **Fresh load in dark mode**: Set OS to dark, clear localStorage, reload — NO color transition flash on load.
8. **Reduced motion**: Enable "Reduce motion" in OS settings → reload — no animations, no transitions.
9. **Body accent border**: Green stripe at top of viewport in both light and dark mode.
10. **Print preview**: Accent border NOT visible. Header/footer hidden (already handled by existing print styles).

## Decision Points

| Decision | Choice | Why |
|---|---|---|
| Animation approach | CSS `@keyframes` only | Respects "minimal JS" project principle |
| Animation duration | 0.4–0.5s | Noticeable but not sluggish |
| Home card hover | `translateY(-2px)` + box-shadow | Subtle lift; -2px avoids cartoonish feel |
| Active nav styling | Color + font-weight (not underline) | Underline felt too heavy for minimal aesthetic |
| Post list hover | Left padding indent | Background color change was considered but adds visual noise |
| Theme transition suppression | `.no-transition` + double-rAF | More reliable than `setTimeout(0)` |
| Reduced motion | Blanket `animation-duration: 0.01ms` | Standard pattern; covers all elements without listing each |

## Future Enhancements

- Scroll-triggered animations for below-fold elements (requires `IntersectionObserver` — JS)
- Home cards could get a colored left border on hover
- Post list items could reveal excerpts on hover via `max-height` transition

## Implementation Progress

All 15 steps completed successfully. Hugo build passes cleanly with no errors.

**Files modified (6):**
- `themes/minimal/assets/css/base.css` — Added keyframes (fadeInUp, fadeIn), body accent border, theme transition CSS + .no-transition suppressor
- `themes/minimal/assets/css/layout.css` — Hero animations, home card hover/stagger, dark mode shadow override, active nav styles, post list hover indent + font-size bump
- `themes/minimal/assets/css/article.css` — Article header staggered animations, HR accent color styling
- `themes/minimal/assets/css/responsive.css` — prefers-reduced-motion media query, print body border-top: none
- `themes/minimal/layouts/partials/header.html` — Active nav class conditionals using hasPrefix
- `themes/minimal/layouts/partials/head.html` — Extended inline script with .no-transition + double-rAF logic

No deviations from the plan. All changes implemented exactly as specified.
