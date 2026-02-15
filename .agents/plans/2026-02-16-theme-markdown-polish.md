---
date: 2026-02-16
title: Theme Markdown Element Polish
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents: []
---

# Theme Markdown Element Polish

## Goal/Overview

The Hugo "minimal" theme (`themes/minimal/`) supports code blocks, tables, alerts, and basic
typography, but several standard Markdown/HTML elements render with unstyled browser defaults. This
plan adds **CSS styling, render hooks, config changes, and example content** for:

1. Footnotes
2. Task list checkboxes
3. `<mark>` (highlight text via `==text==`)
4. `<ins>` (inserted text via `++text++`)
5. `<sub>` / `<sup>` (subscript/superscript via `~text~` / `^text^`)
6. `<kbd>` (keyboard keys)
7. `<details>` / `<summary>` (collapsible sections)
8. Heading anchors (clickable `#` links for deep-linking)
9. External link treatment (`target="_blank"`, visual indicator)

**Out of scope** (explicitly deferred):

- Table of Contents (`{{ .TableOfContents }}`)
- Related content (`[related]` config)
- Math/LaTeX passthrough rendering
- Markdown block attributes (`{.class #id}`)

### Design principles (from AGENTS.md)

- **Theme portability**: the theme at `themes/minimal/` must remain decoupled from site-specific
  content. All styles use CSS custom properties. No hardcoded site URLs.
- **Minimal JavaScript**: only used where CSS can't do the job. All work in this plan is CSS-only or
  template-only — no new JS.
- **Light/dark mode**: every new style must work in both modes. Use existing CSS custom properties
  (`--color-*`) or add new ones in both the light `:root` and dark `@media`/`[data-theme="dark"]`
  blocks.
- **Data-driven**: config values go in `hugo.toml` params, not hardcoded in theme templates.

---

## Dependencies

- **Hugo v0.155+** (already in use)
- **Font Awesome Free 6.x SVGs** — one new icon needed for external links (download from GitHub raw
  URL per existing pattern in AGENTS.md Icons section)
- No new packages, npm dependencies, or build tools

---

## File Structure

### New files

| File                                                          | Purpose                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `themes/minimal/layouts/_default/_markup/render-heading.html` | Heading anchor render hook                                               |
| `themes/minimal/layouts/_default/_markup/render-link.html`    | External link render hook                                                |
| `themes/minimal/assets/icons/arrow-up-right-from-square.svg`  | External link icon (Font Awesome `solid/arrow-up-right-from-square.svg`) |

### Modified files

| File                                                                     | Changes                                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `themes/minimal/assets/css/article.css`                                  | CSS for footnotes, task lists, mark, ins, sub/sup, kbd, details/summary, heading anchors, external link icon |
| `themes/minimal/assets/css/base.css`                                     | New CSS custom properties for mark/kbd colours (light + dark)                                                |
| `themes/minimal/exampleSite/hugo.toml`                                   | Enable Goldmark extras (mark, insert, subscript, superscript)                                                |
| `themes/minimal/exampleSite/content/blog/markdown-syntax-guide/index.md` | Add/update demo sections                                                                                     |
| `hugo.toml` (main site)                                                  | Enable Goldmark extras (mark, insert, subscript, superscript)                                                |
| `themes/minimal/README.md`                                               | Document new features and required Goldmark config                                                           |
| `SYNTAX.md`                                                              | Add authoring reference for new elements                                                                     |

---

## Component Breakdown

### 1. Footnote Styling (CSS only)

**No template or config changes.** Hugo's Goldmark outputs footnotes with these classes/structure by
default:

```html
<!-- In-text reference -->
<sup class="footnote-ref" id="fnref:1"><a href="#fn:1">1</a></sup>

<!-- Footnotes section at bottom -->
<div class="footnotes" role="doc-endnotes">
  <hr />
  <ol>
    <li id="fn:1">
      <p>
        Footnote text.&nbsp;<a href="#fnref:1" class="footnote-backref" role="doc-backlink">↩︎</a>
      </p>
    </li>
  </ol>
</div>
```

**CSS rules to add in `article.css`:**

```css
/* Footnotes */
.article-content .footnotes {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.article-content .footnotes hr {
  display: none; /* Hugo inserts an <hr> we don't need — we use border-top on .footnotes */
}

.article-content .footnotes ol {
  margin-left: 1.25rem;
}

.article-content .footnotes li {
  margin-bottom: 0.5rem;
}

.article-content .footnotes li p {
  margin-bottom: 0.25rem;
}

.article-content .footnote-ref a {
  text-decoration: none;
  color: var(--color-accent);
  font-weight: 600;
}

.article-content .footnote-backref {
  text-decoration: none;
  color: var(--color-accent);
  margin-left: 0.2rem;
}
```

**Placement:** After the existing `<hr>` styles in `article.css` (around line 175).

---

### 2. Task List Styling (CSS only)

**No template or config changes.** Hugo outputs:

```html
<ul>
  <li><input checked="" disabled="" type="checkbox" /> Write the theme</li>
  <li><input disabled="" type="checkbox" /> World domination</li>
</ul>
```

**CSS rules to add in `article.css`:**

```css
/* Task lists */
.article-content li:has(> input[type="checkbox"]) {
  list-style: none;
  margin-left: -1.5rem;
}

.article-content input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 1.1em;
  height: 1.1em;
  border: 2px solid var(--color-border);
  border-radius: 3px;
  vertical-align: -0.15em;
  margin-right: 0.4em;
  position: relative;
  cursor: default;
}

.article-content input[type="checkbox"]:checked {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.article-content input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 0.25em;
  top: 0.05em;
  width: 0.35em;
  height: 0.6em;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
```

**Note on `:has()`:** Supported in all modern browsers (Safari 15.4+, Chrome 105+, Firefox 121+).
This is acceptable for the theme's target audience. No fallback needed — without `:has()`, the only
issue is the bullet remains visible alongside the checkbox, which is the current unstyled behaviour
anyway.

**Placement:** After the footnote styles.

---

### 3. `<mark>` Highlight Styling (Config + CSS)

**Config change required.** The `==text==` syntax needs enabling in `hugo.toml`:

```toml
[markup.goldmark.extensions.extras.mark]
  enable = true
```

Add to **both** `themes/minimal/exampleSite/hugo.toml` and `hugo.toml` (main site) under the
existing `[markup.goldmark]` section.

**CSS custom properties to add in `base.css`:**

```css
/* In :root (light mode) */
--color-mark-bg: #fff3b0;
--color-mark-text: inherit;

/* In @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } } */
--color-mark-bg: #5c4b00;
--color-mark-text: #f5e6b8;

/* In :root[data-theme="dark"] { ... } */
--color-mark-bg: #5c4b00;
--color-mark-text: #f5e6b8;
```

**CSS rule in `article.css`:**

```css
/* Highlighted text (<mark>) */
.article-content mark {
  background: var(--color-mark-bg);
  color: var(--color-mark-text);
  padding: 0.1em 0.3em;
  border-radius: 3px;
}
```

---

### 4. `<ins>` Insert Styling (Config + CSS)

**Config change required:**

```toml
[markup.goldmark.extensions.extras.insert]
  enable = true
```

Add to both `hugo.toml` files alongside the mark config.

**CSS rule in `article.css`:**

```css
/* Inserted text (<ins>) */
.article-content ins {
  text-decoration: underline;
  text-decoration-color: var(--color-accent);
  text-underline-offset: 2px;
  text-decoration-thickness: 2px;
}
```

---

### 5. `<sub>` / `<sup>` Line-Height Fix (Config + CSS)

**Config change required:**

```toml
[markup.goldmark.extensions.extras.subscript]
  enable = true
[markup.goldmark.extensions.extras.superscript]
  enable = true
```

**CSS rules in `article.css`:**

```css
/* Sub/superscript — prevent line-height disruption */
.article-content sub,
.article-content sup {
  font-size: 0.8em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

.article-content sup {
  top: -0.5em;
}

.article-content sub {
  bottom: -0.25em;
}
```

---

### 6. `<kbd>` Styling (CSS only)

**No config change needed.** `<kbd>` is raw HTML, available when `unsafe = true` (already enabled).

**CSS custom properties to add in `base.css`:**

```css
/* In :root (light mode) */
--color-kbd-bg: #f0f0f4;
--color-kbd-border: #c8c8d0;

/* In dark blocks */
--color-kbd-bg: #2a2a32;
--color-kbd-border: #4a4a55;
```

**CSS rules in `article.css`:**

```css
/* Keyboard keys */
.article-content kbd {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--color-kbd-bg);
  border: 1px solid var(--color-kbd-border);
  border-radius: 4px;
  padding: 0.15em 0.4em;
  box-shadow: 0 1px 0 var(--color-kbd-border);
  white-space: nowrap;
}
```

The `box-shadow` on the bottom creates the classic "keycap" look.

---

### 7. `<details>` / `<summary>` Styling (CSS only)

**No config change needed.** Raw HTML, available with `unsafe = true`.

**CSS rules in `article.css`:**

```css
/* Collapsible details/summary */
.article-content details {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.75rem 1.25rem;
  margin: 1.5rem 0;
  background: var(--color-bg-secondary);
}

.article-content summary {
  cursor: pointer;
  font-weight: 600;
  padding: 0.25rem 0;
  color: var(--color-heading, var(--color-text));
}

.article-content summary::marker {
  color: var(--color-accent);
}

.article-content details[open] summary {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.article-content details > :last-child {
  margin-bottom: 0;
}
```

---

### 8. Heading Anchors (Render Hook)

**New file:** `themes/minimal/layouts/_default/_markup/render-heading.html`

Hugo provides `.Level`, `.Anchor`, `.Text`, `.Attributes` in the heading render hook context.

```go-html-template
<h{{ .Level }} id="{{ .Anchor }}"
  {{- range $k, $v := .Attributes }}
    {{- if ne $k "id" }}
      {{- printf " %s=%q" $k $v | safeHTMLAttr }}
    {{- end }}
  {{- end -}}
>
  {{- .Text -}}
  <a href="#{{ .Anchor }}" class="heading-anchor" aria-label="Link to this section">#</a>
</h{{ .Level }}>
```

**CSS rules in `article.css`:**

```css
/* Heading anchors */
.article-content .heading-anchor {
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-left: 0.4em;
  font-weight: 400;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.article-content h2:hover .heading-anchor,
.article-content h3:hover .heading-anchor,
.article-content h4:hover .heading-anchor,
.article-content h5:hover .heading-anchor,
.article-content h6:hover .heading-anchor {
  opacity: 0.5;
}

.article-content .heading-anchor:hover {
  opacity: 1;
  color: var(--color-accent);
}
```

**Note:** The anchor link uses `#` as text (not an icon) to keep it minimal. `aria-label` provides
accessibility. The link is hidden until the heading is hovered.

---

### 9. External Link Treatment (Render Hook)

**New file:** `themes/minimal/layouts/_default/_markup/render-link.html`

Hugo provides `.Destination`, `.Text`, `.Title`, `.Page` in the link render hook context.

```go-html-template
{{- $isExternal := hasPrefix .Destination "http" -}}
{{- if $isExternal -}}
  {{- $siteHost := urls.Parse .Page.Site.BaseURL -}}
  {{- $linkHost := urls.Parse .Destination -}}
  {{- if eq $linkHost.Host $siteHost.Host -}}
    {{- $isExternal = false -}}
  {{- end -}}
{{- end -}}
<a href="{{ .Destination | safeURL }}"
  {{- with .Title }} title="{{ . }}"{{ end }}
  {{- if $isExternal }} target="_blank" rel="noopener"{{ end -}}
>
  {{- .Text -}}
</a>
{{- if $isExternal -}}
  <span class="external-link-icon" aria-hidden="true">{{ partial "icon.html" (dict "name" "arrow-up-right-from-square") }}</span>
{{- end -}}
```

**New icon:** Download `arrow-up-right-from-square.svg` from Font Awesome:

```
https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/arrow-up-right-from-square.svg
```

Save to `themes/minimal/assets/icons/arrow-up-right-from-square.svg`.

**CSS rules in `article.css`:**

```css
/* External link icon */
.article-content .external-link-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 0.15em;
}

.article-content .external-link-icon .icon-inline {
  display: inline-flex;
}

.article-content .external-link-icon svg {
  width: 0.7em;
  height: 0.7em;
  fill: currentColor;
  opacity: 0.5;
  vertical-align: baseline;
  position: relative;
  top: -0.1em;
}
```

**Important design decision:** The icon is wrapped in a `<span>` outside the `<a>` tag so it doesn't
become part of the link's underline. The icon inherits the link colour via `currentColor` but is
semi-transparent to stay subtle.

**Edge case handling:**

- Links that start with `http` but match the site's own hostname are treated as internal (e.g.,
  absolute links to the same site).
- Fragment-only links (`#section`) and relative links are always internal.
- Mail links (`mailto:`) don't start with `http` so they're internal by default — correct behaviour.

---

## Integration Points

### CSS file organisation

All new CSS goes into `themes/minimal/assets/css/article.css` which is already concatenated with
other CSS files via Hugo Pipes in `themes/minimal/layouts/partials/head.html`:

```go-html-template
{{ $style := slice $base $layout $article $sections $responsive $syntax | resources.Concat "css/style.css" | minify | fingerprint }}
```

No changes to the concatenation pipeline needed.

### CSS custom properties

New variables (`--color-mark-bg`, `--color-mark-text`, `--color-kbd-bg`, `--color-kbd-border`) must
be added in **three** places in `themes/minimal/assets/css/base.css`:

1. `:root { ... }` (light mode defaults) — around line 32
2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` — around line
   63
3. `:root[data-theme="dark"] { ... }` — around line 97

Follow the exact pattern used by existing variables like `--color-code-bg`.

### Render hooks

All render hooks live in `themes/minimal/layouts/_default/_markup/`. The existing hooks
(`render-blockquote.html`, `render-codeblock.html`, `render-image.html`, `render-table.html`) follow
a consistent pattern: standard HTML output with `.Attributes` support and use of the `icon.html`
partial for inline SVGs.

### Icon partial

The icon partial at `themes/minimal/layouts/partials/icon.html` loads SVGs from
`themes/minimal/assets/icons/<name>.svg` and inlines them wrapped in
`<span class="icon-inline" aria-hidden="true">`. The external link icon should use this partial (as
the alert icons do).

---

## Implementation Order

Execute in this order. Each step should build and pass `hugo --theme minimal --themesDir ../..` from
the exampleSite directory before moving to the next.

### Step 1: CSS-only styling (no config or template changes)

- [x] **1a.** Add footnote CSS to `article.css`
- [x] **1b.** Add task list checkbox CSS to `article.css`
- [x] **1c.** Add `<kbd>` CSS custom properties to `base.css` (light + dark) and rules to
      `article.css`
- [x] **1d.** Add `<details>` / `<summary>` CSS to `article.css`
- [x] **1e.** Add `<sub>` / `<sup>` line-height fix CSS to `article.css`
- [x] **1f.** Verify build succeeds

### Step 2: Config + CSS (Goldmark extras)

- [x] **2a.** Add `<mark>` CSS custom properties to `base.css` (light + dark) and rules to
      `article.css`
- [x] **2b.** Add `<ins>` CSS to `article.css`
- [x] **2c.** Enable Goldmark extras in `themes/minimal/exampleSite/hugo.toml`: mark, insert,
      subscript, superscript
- [x] **2d.** Enable Goldmark extras in `hugo.toml` (main site): mark, insert, subscript,
      superscript
- [x] **2e.** Verify build succeeds

### Step 3: Render hooks

- [x] **3a.** Create `themes/minimal/layouts/_default/_markup/render-heading.html` with anchor links
- [x] **3b.** Add heading anchor CSS to `article.css`
- [x] **3c.** Download `arrow-up-right-from-square.svg` to `themes/minimal/assets/icons/`
- [x] **3d.** Create `themes/minimal/layouts/_default/_markup/render-link.html` with external link
      detection
- [x] **3e.** Add external link icon CSS to `article.css`
- [x] **3f.** Verify build succeeds

### Step 4: Example content + docs

- [x] **4a.** Update `themes/minimal/exampleSite/content/blog/markdown-syntax-guide/index.md`:
  - Under "Text Formatting": add `==highlighted text==`, `++inserted text++`, `H~2~O`, `x^2^`
    examples
  - Add "Keyboard Shortcuts" subsection with `<kbd>` examples
  - Verify existing `<details>` example renders correctly; improve if needed
  - Verify existing footnote and task list examples render correctly
  - Add a note about heading anchor links (hover any heading)
  - Ensure at least one external link is present to demo the icon
- [x] **4b.** Update `SYNTAX.md` with authoring reference for: `<mark>`, `<ins>`, `<sub>`/`<sup>`,
      `<kbd>`, `<details>`, heading anchors, external link behaviour
- [x] **4c.** Update `themes/minimal/README.md`: document new features and note which Goldmark
      extensions require site-level config
- [x] **4d.** Verify full build of both example site and main site succeeds
- [x] **4e.** Clean up: remove `themes/minimal/exampleSite/public/` if generated

---

## Error Handling & Edge Cases

| Scenario                                     | Handling                                                                                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Site doesn't enable Goldmark extras          | `==text==` / `++text++` / `~sub~` / `^sup^` render as literal text — no breakage, just no styling                                              |
| External link icon SVG missing               | `icon.html` partial guards with `{{ if $icon }}` — link renders normally, just no icon                                                         |
| Heading with no anchor ID                    | Hugo always generates `.Anchor` from heading text — should never be empty. Guard with `{{ with .Anchor }}` in the template as a safety measure |
| Link with non-http scheme (mailto:, tel:)    | `hasPrefix .Destination "http"` is false — renders as internal link. Correct behaviour                                                         |
| Absolute link to own site                    | `urls.Parse` comparison catches same-hostname links and treats them as internal                                                                |
| `:has()` CSS unsupported (very old browsers) | Task list bullets stay visible alongside checkboxes — graceful degradation, matches current behaviour                                          |
| `<kbd>` not present (no raw HTML)            | CSS rules simply don't match — no impact                                                                                                       |
| `<details>` not present                      | CSS rules simply don't match — no impact                                                                                                       |

---

## Testing Strategy

1. **Visual testing**: Start `hugo server --buildDrafts --theme minimal --themesDir ../..` from the
   example site directory and verify each element in the markdown syntax guide post
2. **Light/dark mode**: Toggle between modes and verify all new elements have appropriate contrast
   in both
3. **Build verification**: Run `hugo --theme minimal --themesDir ../..` from the example site — must
   succeed with no errors or warnings
4. **Main site build**: Run `hugo` from the project root — must succeed
5. **Responsive**: Check the syntax guide post at mobile widths (~375px) — no elements should
   overflow or break layout
6. **Hover states**: Verify heading anchors appear on hover, external link icon is visible but
   subtle
7. **Footnote navigation**: Click a footnote ref `[1]` — should scroll to footnote. Click backref
   `↩` — should scroll back.
8. **External links**: Verify they open in new tabs with the small arrow icon. Verify internal links
   do NOT get the icon or `target="_blank"`.

---

## Decision Points

### Decisions made

| Decision                         | Choice                                     | Reasoning                                                                                                        |
| -------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Heading anchor text              | `#` character                              | Minimal and recognisable; avoids adding another SVG icon. Matches common convention (GitHub, MDN).               |
| Heading anchor visibility        | Hidden, shown on hover                     | Keeps the reading experience clean. Discoverable on interaction.                                                 |
| External link icon placement     | Outside the `<a>` tag                      | Prevents the icon from being part of the link underline. Stays visually attached via margin.                     |
| External link icon               | Font Awesome SVG via `icon.html` partial   | Consistent with existing icon system. Inlined at build time, no external requests.                               |
| Task list checkbox               | Custom CSS checkbox via `appearance: none` | Full control over styling in both light/dark modes. Consistent look across browsers.                             |
| `:has()` selector for task lists | Use without fallback                       | Browser support is sufficient (2023+). Fallback is the current unstyled state — acceptable graceful degradation. |
| `<mark>` colours                 | Amber/yellow (light), dark amber (dark)    | Classic highlight colour that works in both modes. Doesn't clash with alert colours.                             |
| `<kbd>` styling                  | Keycap look with border + box-shadow       | Universally recognised pattern for keyboard keys.                                                                |
| Footnote `<hr>`                  | Hide with `display: none`                  | Replace with `border-top` on `.footnotes` for more control over spacing and styling.                             |

### Rejected approaches

| Approach                                                       | Why rejected                                                                                                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Using `accent-color` CSS property for checkboxes               | Less control over styling, inconsistent across browsers, doesn't support dark mode well                                                                                     |
| Unicode arrow `↗` for external links                           | Inconsistent rendering across fonts/platforms. SVG icon is pixel-perfect.                                                                                                   |
| Separate CSS file for new styles                               | All styles are article-content-scoped and belong with the existing article typography in `article.css`. Adding another file to the concat pipeline is unnecessary overhead. |
| `<details>` with custom triangle icon                          | `summary::marker` with accent colour is simpler and sufficient. Custom icons add complexity for minimal gain.                                                               |
| Adding external link detection in CSS only (`a[href^="http"]`) | Can't distinguish own-site absolute URLs from truly external ones. Template-level detection with hostname comparison is more accurate.                                      |

---

## Future Enhancements

- **Copy heading link to clipboard**: Add a small JS handler on heading anchor click that copies the
  URL to clipboard and shows a brief confirmation (similar to the existing code block copy button).
- **Smooth scroll to footnotes**: Add `scroll-behavior: smooth` or a small scroll animation when
  clicking footnote refs/backrefs.
- **Collapsible alert variant**: Use the `AlertSign` field (`+`/`-`) from Hugo's extended alert
  syntax to render alerts as collapsible `<details>` elements.
- **Configurable external link behaviour**: Add a `params.externalLinksNewTab` boolean to allow
  sites to opt out of `target="_blank"`.

---

## Implementation Progress

**Step 1 — CSS-only styling**: Added all CSS rules to `article.css` in one batch (footnotes, task
lists, kbd, details/summary, sub/sup, mark, ins, heading anchors, external link icon). Added
`--color-mark-bg`, `--color-mark-text`, `--color-kbd-bg`, `--color-kbd-border` custom properties to
all three blocks in `base.css` (light root, dark media query, dark data-theme). Build verified.

**Step 2 — Goldmark extras**: Enabled `mark`, `insert`, `subscript`, `superscript` extensions in
both `themes/minimal/exampleSite/hugo.toml` and root `hugo.toml`. Build verified.

**Step 3 — Render hooks**: Created `render-heading.html` with anchor links (guarded with
`{{ with .Anchor }}`). Downloaded `arrow-up-right-from-square.svg` from Font Awesome 6.x. Created
`render-link.html` with external link detection via hostname comparison and icon via `icon.html`
partial. Build verified.

**Step 4 — Example content + docs**: Updated markdown syntax guide with demos for mark, ins,
sub/sup, kbd, details/summary, heading anchors, external links, and footnotes. Added authoring
reference sections to `SYNTAX.md` for all new elements. Updated `themes/minimal/README.md` with
feature bullet and Goldmark extras config docs. Both example site and main site builds verified.
Cleaned up generated `public/` directory.

No deviations from the plan. All steps completed successfully.
