---
date: 2026-02-15
title: Code Block Copy Button
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents: []
---

# Code Block Copy Button

## Goal/Overview

Add a "copy to clipboard" button to all code blocks on the site. When clicked, the button copies the raw code text (without line numbers) and shows brief visual feedback ("copied" checkmark). The button should appear on hover (desktop) and always be visible on touch devices. It must work with both light and dark themes.

The site is a Hugo static site with a custom theme at `themes/minimal/`. The theme must remain portable (no site-specific content). Read `AGENTS.md` at project root for full theme/site separation rules before making changes.

## Dependencies

**No new packages or tools.** The implementation uses:
- Hugo's built-in `render-codeblock` hook (supported since Hugo 0.93+, site runs 0.155+)
- The `navigator.clipboard` Web API (supported in all modern browsers)
- Two SVG icons from Font Awesome Free 6.x (already used for other icons on the site)

## File Structure

### New Files

| File | Purpose |
|------|---------|
| `themes/minimal/assets/icons/copy.svg` | Copy icon (Font Awesome `regular/copy.svg`) |
| `themes/minimal/assets/icons/check.svg` | Checkmark icon (Font Awesome `solid/check.svg`) |
| `themes/minimal/layouts/_default/_markup/render-codeblock.html` | Render hook that wraps code blocks with a copy button |

### Modified Files

| File | Change |
|------|--------|
| `themes/minimal/assets/css/syntax.css` | Add `.copy-btn` styles (positioning, theming, hover/copied states) |
| `themes/minimal/layouts/_default/baseof.html` | Add copy-to-clipboard JS (event delegation, clipboard API) |

## Component Breakdown

### 1. SVG Icons

Download from Font Awesome Free 6.x GitHub repo (same source as existing icons):
- **Copy icon**: `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/copy.svg`
- **Check icon**: `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/check.svg`

Save to `themes/minimal/assets/icons/`. These are inlined at build time via Hugo's `resources.Get` — no external requests at runtime.

### 2. Render Hook (`render-codeblock.html`)

Hugo render hooks intercept fenced code blocks during Markdown rendering. The hook receives:
- `.Type` — the language identifier (e.g., `yaml`, `go`, `text`)
- `.Inner` — the raw code text (no HTML, no spans)
- `.Options` — map of options from the code fence attributes
- `.Attributes` — HTML attributes from the code fence
- `.Ordinal` — sequential index of the code block on the page

The hook should:
1. Call Hugo's built-in `transform.Highlight` to produce the same `.highlight > pre > code` HTML that Hugo normally generates
2. Wrap the result in a `.code-block-wrapper` div
3. Insert a `<button class="copy-btn">` containing the copy SVG icon inline
4. Store the raw code in a way the JS can access (see JS section)

```html
{{- $opts := .Options }}
{{- $attrs := .Attributes }}
{{- $highlighted := transform.HighlightCodeBlock . }}
<div class="code-block-wrapper">
  <button class="copy-btn" aria-label="Copy code" title="Copy code">
    <span class="copy-icon">{{ (resources.Get "icons/copy.svg").Content | safeHTML }}</span>
    <span class="check-icon">{{ (resources.Get "icons/check.svg").Content | safeHTML }}</span>
  </button>
  {{ $highlighted }}
</div>
{{- }}
```

**Key design choice**: Both icons are always in the DOM; CSS toggles visibility via the `.copied` class. This avoids JS DOM manipulation for the icon swap.

**Important**: `transform.HighlightCodeBlock` is the correct function to use inside a render-codeblock hook (not `highlight`). It accepts the hook context directly and respects all code fence options (`linenos`, `hl_lines`, etc.).

### 3. CSS Styles (in `syntax.css`)

Add at the end of the file, before any `@media` queries if needed. The styles should cover:

```css
/* ---------- Copy Button ---------- */
.code-block-wrapper {
  position: relative;
}

.copy-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-code-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  z-index: 1;
}

.copy-btn svg {
  width: 14px;
  height: 14px;
  fill: currentColor;
}

/* Show on hover (desktop) */
.code-block-wrapper:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

/* Copied state */
.copy-btn .check-icon {
  display: none;
}

.copy-btn.copied .copy-icon {
  display: none;
}

.copy-btn.copied .check-icon {
  display: flex;
}

.copy-btn.copied {
  opacity: 1;
  color: var(--color-accent);
  border-color: var(--color-accent);
}
```

**Touch devices**: On mobile/touch where there's no hover, the button staying at `opacity: 0` is a problem. Add a media query or use `@media (hover: none)` to make it always visible (at reduced opacity):

```css
@media (hover: none) {
  .copy-btn {
    opacity: 0.6;
  }
}
```

**Design reference**: The `.back-to-top` button in `themes/minimal/assets/css/layout.css` uses a similar pattern (border, border-radius, accent color on hover). Match that visual language.

### 4. JavaScript (in `baseof.html`)

Add to the existing `<script>` block in `themes/minimal/layouts/_default/baseof.html`, inside the existing IIFE. Use event delegation — one listener handles all copy buttons.

```javascript
// Code block copy buttons
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.copy-btn');
  if (!btn) return;

  var wrapper = btn.closest('.code-block-wrapper');
  if (!wrapper) return;

  // Handle both simple and line-number-table structures:
  // Simple:  .highlight > pre > code
  // Table:   .highlight > .lntable > ... > .lntd:last-child code
  var codeEl = wrapper.querySelector('.lntd:last-child code') ||
               wrapper.querySelector('pre code');
  if (!codeEl) return;

  var text = codeEl.textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showCopied(btn);
    });
  }

  function showCopied(b) {
    b.classList.add('copied');
    setTimeout(function() {
      b.classList.remove('copied');
    }, 2000);
  }
});
```

**Key decisions**:
- **Event delegation** over per-button listeners: fewer event listeners, works with dynamic content
- **No fallback for old browsers**: `navigator.clipboard` is supported in all browsers that matter (Chrome 66+, Firefox 63+, Safari 13.1+). If unavailable, the button simply does nothing — no broken UX
- **`codeEl.textContent`** strips all HTML tags and gives clean code text. For the line-number table case, targeting `.lntd:last-child code` skips the line number column entirely
- **2-second feedback**: the `.copied` class is added then removed after 2 seconds, matching common UX patterns (GitHub, MDN, etc.)

### 5. Include Shortcode — No Changes Needed

The `include` shortcode at `themes/minimal/layouts/shortcodes/include.html` uses Hugo's `highlight` template function directly, which outputs the same `.highlight > pre > code` (or `.highlight > .lntable > ...`) HTML structure.

However, the render-codeblock hook only applies to **fenced code blocks in Markdown**, not to the `highlight` function called from shortcodes/templates. This means `include` shortcode output will **not** automatically get the copy button wrapper.

**Two options**:
1. **Modify the include shortcode** to add the same wrapper div and button. This duplicates the wrapper markup but keeps both code paths working.
2. **Use JS to inject buttons** into any `.highlight` block that isn't already inside a `.code-block-wrapper`. This is a single injection point but adds more JS.

**Recommended: Option 1** — modify the `include` shortcode. It's explicit, no runtime DOM manipulation, and the wrapper is just 3 lines of HTML. Add the same `.code-block-wrapper` div and `.copy-btn` button around the `{{ highlight ... }}` call in the shortcode.

The shortcode modification:
```html
{{- /* ... existing param handling ... */ -}}

<div class="code-block-wrapper">
  <button class="copy-btn" aria-label="Copy code" title="Copy code">
    <span class="copy-icon">{{ (resources.Get "icons/copy.svg").Content | safeHTML }}</span>
    <span class="check-icon">{{ (resources.Get "icons/check.svg").Content | safeHTML }}</span>
  </button>
  {{- highlight $content $lang $optStr -}}
</div>
```

## Integration Points

| Existing code | How it connects |
|---|---|
| Hugo's Markdown rendering pipeline | The render-codeblock hook intercepts all fenced code blocks site-wide |
| `themes/minimal/assets/css/syntax.css` | New styles appended — uses existing CSS custom properties (`--color-border`, `--color-code-bg`, `--color-text-secondary`, `--color-accent`) so light/dark mode works automatically |
| `themes/minimal/layouts/_default/baseof.html` | JS added to existing `<script>` block — same pattern as back-to-top button |
| `themes/minimal/layouts/shortcodes/include.html` | Wrapper added around existing `highlight` call |
| `themes/minimal/assets/icons/` | New SVGs follow existing convention (Font Awesome Free 6.x, inlined at build time via `resources.Get`) |
| Hugo Pipes CSS concatenation in `head.html` | No changes needed — `syntax.css` is already in the bundle |

## Implementation Order

1. ☑ **Download SVG icons** — `copy.svg` and `check.svg` to `themes/minimal/assets/icons/`
2. ☑ **Create render-codeblock hook** — `themes/minimal/layouts/_default/_markup/render-codeblock.html`
3. ☑ **Add CSS** — append copy button styles to `themes/minimal/assets/css/syntax.css`
4. ☑ **Add JavaScript** — append clipboard logic to `themes/minimal/layouts/_default/baseof.html`
5. ☑ **Modify include shortcode** — wrap output in `themes/minimal/layouts/shortcodes/include.html`
6. ☑ **Test** — verify all code block variants render correctly with the copy button

## Error Handling

| Scenario | Handling |
|---|---|
| `navigator.clipboard` unavailable (HTTP, old browser) | Button renders but click does nothing. No error shown. |
| Empty code block | `textContent` returns empty string — clipboard gets empty string. Harmless. |
| Multiple rapid clicks | Each click resets the 2-second timer. The `.copied` class is added/removed cleanly. No race condition since `setTimeout` IDs aren't tracked — worst case the class is removed slightly early. |
| Code block with only line numbers (edge case) | The selector prioritizes `.lntd:last-child code` which is always the code column, never the line number column. |
| SVG icon missing | Hugo build will fail with a clear error from `resources.Get`. This is caught at build time, not runtime. |

## Testing Strategy

Run `hugo server --buildDrafts` and verify on these pages:

1. **`/blog/2026/02/building-this-website/`** — has multiple fenced code blocks (yaml, text) without line numbers
2. **`/blog/2026/02/hello-world/`** — has an `include` shortcode rendering Python code

Test matrix:

| Variant | What to check |
|---|---|
| Plain fenced code block | Button appears on hover, copies clean text |
| Code block with `linenos=table` | Button copies code only, not line numbers |
| Code block with `hl_lines` | Button copies text without highlight artifacts |
| `include` shortcode | Button appears and works identically |
| Dark mode | Button colors match theme, visible against dark background |
| Light mode | Button colors match theme, visible against light background |
| Mobile viewport | Button visible without hover (touch device media query) |
| Click → "copied" state | Check icon appears, reverts after ~2 seconds |

Also verify:
- `hugo --minify` builds without errors (production build)
- No Lighthouse accessibility regression (button has `aria-label`)
- The copy button doesn't interfere with text selection inside code blocks

## Decision Points

| Decision | Choice | Rationale |
|---|---|---|
| Render hook vs. JS injection | Render hook | Cleaner — HTML is correct at build time, no FOUC, no DOM manipulation on page load |
| Icon swap approach | Both icons in DOM, CSS toggle | Simpler than JS innerHTML swap, no flicker, works without JS for visual layout |
| Where to put JS | Existing `<script>` in `baseof.html` | Follows established pattern (back-to-top, scroll-reveal are there). No separate JS file needed for ~20 lines. |
| Event delegation vs. per-button listeners | Event delegation | One listener for all buttons, works if content is dynamic, simpler code |
| How to get raw code text | `codeEl.textContent` | Clean text extraction, strips all HTML spans. No need for `data-code` attribute or hidden elements. |
| Include shortcode: duplicate wrapper vs. JS injection | Duplicate wrapper | Explicit, no runtime cost, works without JS, matches render hook output exactly |
| Touch device visibility | `@media (hover: none)` at reduced opacity | Standard approach, doesn't penalize desktop users with always-visible buttons |
| Fallback for clipboard API | None (silent no-op) | All supported browsers have `navigator.clipboard`. Graceful degradation — button just doesn't work. |

### Rejected Approaches

| Approach | Why rejected |
|---|---|
| **Hugo module / npm package** (e.g., `hugo-code-copy`) | Adds external dependency. The implementation is ~50 lines of CSS + JS. Not worth a dependency. |
| **`data-code` attribute on wrapper** | Would duplicate code text in HTML output, increasing page size. `textContent` extraction is simpler and smaller. |
| **Separate JS file** | Only ~20 lines of JS. A separate file adds an HTTP request for negligible code. Inline in `baseof.html` matches existing patterns. |
| **CSS-only copy** (no JS) | Not possible. Clipboard access requires JavaScript. |
| **Showing button always on desktop** | Clutters the reading experience. Hover-to-reveal is the standard pattern (GitHub, MDN, docs sites). |

## Future Enhancements

- **Language label**: Show the code language (e.g., "yaml", "go") in the top-left corner of code blocks. The render hook already has access to `.Type`.
- **Keyboard shortcut**: Focus management for accessibility — let users tab to the copy button.
- **Toast notification**: Instead of in-place icon swap, show a brief toast. Probably overkill for a personal blog.

## Implementation Progress

- **Step 1**: Downloaded `copy.svg` (FA regular/copy) and `check.svg` (FA solid/check) from Font Awesome 6.7.2
- **Step 2**: Created render-codeblock hook using `transform.HighlightCodeBlock` with wrapper div and copy button containing both icons
- **Step 3**: Appended copy button CSS to syntax.css — positioning, hover states, copied state, touch device media query
- **Step 4**: Added clipboard JS to baseof.html using event delegation, handles both simple and line-number-table code blocks
- **Step 5**: Wrapped include shortcode output in same `.code-block-wrapper` with copy button
- **Step 6**: `hugo --minify` builds cleanly. Verified copy buttons present on building-this-website (4 fenced code blocks) and hello-world (2 include shortcode blocks). No deviations from plan.
