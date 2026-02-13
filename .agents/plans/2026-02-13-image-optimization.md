---
date: 2026-02-13
title: Image Optimization
directory: /Users/del-boy/src/bojan.delic.rs
project: bojan.delic.rs
status: completed
dependencies: []
dependents: []
---

# Image Optimization During Hugo Build

## Goal/Overview

Implement automatic image optimization for the Hugo static site. Currently, cover images are served as raw originals (PNG/JPEG, totaling ~3.5MB for just two posts). This plan uses Hugo's built-in image processing pipeline to generate responsive, multi-format images (AVIF + WebP + original fallback) at multiple breakpoints, served via `<picture>` elements.

**Expected outcome**: Dramatically smaller image payloads (50–90% reduction depending on format support), responsive sizing for mobile/desktop, zero layout shift, and no external build tools required.

**Key constraint**: Processed images are cached in `resources/_gen/` which is already gitignored. They are regenerated on each build (locally and in CI). Hugo extended (required, already in use) provides AVIF and WebP encoding.

### Format comparison

| Format | Typical size (1200px photo) | vs PNG | Browser support |
|--------|---------------------------|--------|-----------------|
| PNG | ~1,200 KB | baseline | ~100% |
| JPEG (q80) | ~180 KB | -85% | ~100% |
| WebP (q80) | ~130 KB | -89% | ~97% |
| AVIF (q60) | ~75 KB | -94% | ~93% |

AVIF (AV1 Image File Format, 2019) is based on the AV1 video codec. It excels at low-to-medium bitrates with fewer artifacts in gradients and textures. It's slower to encode than WebP but that only affects build time, not page load. The `<picture>` element lets browsers pick the best format they support — AVIF → WebP → original fallback — with zero penalty for unsupported browsers.

## Dependencies

- **Hugo extended v0.155+** — already in use locally (`v0.155.3+extended`) and in CI (`.github/workflows/deploy.yml` specifies `extended: true`)
- **No new packages or tools** — everything is built into Hugo's image processing API

## File Structure

### New Files
- `themes/minimal/layouts/partials/responsive-image.html` — reusable partial for `<picture>` output
- `themes/minimal/layouts/_default/_markup/render-image.html` — Markdown image render hook

### Modified Files
- `themes/minimal/layouts/_default/single.html` — use responsive partial for cover images
- `themes/minimal/layouts/partials/head.html` — optimize OG/Twitter card images
- `themes/minimal/layouts/partials/json-ld.html` — optimize structured data images
- `themes/minimal/assets/css/article.css` — update selectors for `<picture>` element

### Unchanged
- `.gitignore` — already contains `resources/_gen/`
- `hugo.toml` — no config changes needed
- `.github/workflows/deploy.yml` — already uses Hugo extended

## Component Breakdown

### 1. Reusable Partial: `responsive-image.html`

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/layouts/partials/responsive-image.html`

**Input** (via `dict`):
- `image` (required) — Hugo image resource (e.g., from `.Resources.GetMatch`)
- `alt` (optional, default: `""`) — alt text for the `<img>` tag
- `class` (optional, default: `""`) — CSS class on the wrapping element
- `loading` (optional, default: `"lazy"`) — `"lazy"` or `"eager"`
- `fetchpriority` (optional, default: `""`) — `"high"`, `"low"`, or `"auto"`
- `sizes` (optional, default: `"(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px"`) — the `sizes` attribute for responsive selection

**Output**: A `<picture>` element with:
1. `<source>` for AVIF at 480w, 800w, 1200w with `type="image/avif"`
2. `<source>` for WebP at 480w, 800w, 1200w with `type="image/webp"`
3. `<img>` fallback using the original format resized to 1200w, with `width`, `height`, `loading`, `decoding="async"`, and optional `fetchpriority`

**Implementation**:
```go-html-template
{{- $img := .image -}}
{{- $alt := .alt | default "" -}}
{{- $loading := .loading | default "lazy" -}}
{{- $fetchpriority := .fetchpriority | default "" -}}
{{- $sizes := .sizes | default "(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px" -}}

{{- $widths := slice 480 800 1200 -}}

{{/* Generate AVIF srcset */}}
{{- $avifSrcset := slice -}}
{{- range $w := $widths -}}
  {{- $resized := $img.Process (printf "resize %dx avif q75" $w) -}}
  {{- $avifSrcset = $avifSrcset | append (printf "%s %dw" $resized.RelPermalink $w) -}}
{{- end -}}

{{/* Generate WebP srcset */}}
{{- $webpSrcset := slice -}}
{{- range $w := $widths -}}
  {{- $resized := $img.Process (printf "resize %dx webp q80" $w) -}}
  {{- $webpSrcset = $webpSrcset | append (printf "%s %dw" $resized.RelPermalink $w) -}}
{{- end -}}

{{/* Fallback: original format resized to largest width */}}
{{- $fallback := $img.Process "resize 1200x" -}}

<picture>
  <source
    srcset="{{ delimit $avifSrcset ", " }}"
    sizes="{{ $sizes }}"
    type="image/avif">
  <source
    srcset="{{ delimit $webpSrcset ", " }}"
    sizes="{{ $sizes }}"
    type="image/webp">
  <img
    src="{{ $fallback.RelPermalink }}"
    alt="{{ $alt }}"
    width="{{ $fallback.Width }}"
    height="{{ $fallback.Height }}"
    loading="{{ $loading }}"
    decoding="async"
    {{- with $fetchpriority }}
    fetchpriority="{{ . }}"
    {{- end }}>
</picture>
```

**Edge case — small source images**: If the source image is narrower than a breakpoint width, Hugo's `resize` will NOT upscale — it returns the image at its original width. The `srcset` still works because the browser picks the best available size.

**Note**: Requires Hugo extended for AVIF and WebP encoding. Add a comment at the top of the file noting this requirement.

### 2. Updated Single Post Template

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/layouts/_default/single.html`

Replace the cover image block (lines 3–7). Current code:
```go-html-template
  {{ $cover := .Resources.GetMatch "cover.*" }}
  {{ with $cover }}
  <div class="article-cover">
    <img src="{{ .RelPermalink }}" alt="Cover image" width="{{ .Width }}" height="{{ .Height }}">
  </div>
  {{ end }}
```

New code:
```go-html-template
  {{ $cover := .Resources.GetMatch "cover.*" }}
  {{ with $cover }}
  <div class="article-cover">
    {{ partial "responsive-image.html" (dict "image" . "alt" "Cover image" "loading" "eager" "fetchpriority" "high") }}
  </div>
  {{ end }}
```

**Why `loading="eager"` and `fetchpriority="high"`**: The cover image is above the fold on single post pages. Lazy loading would delay its rendering and hurt LCP (Largest Contentful Paint).

### 3. Updated OG/Twitter Image in `head.html`

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/layouts/partials/head.html`

Replace the OG image block (around lines 34–39). Current code:
```go-html-template
{{ $ogImage := "" -}}
{{ with .Resources.GetMatch "cover.*" -}}
  {{ $ogImage = .Permalink -}}
{{ else -}}
  {{ $ogImage = (printf "%sog-default.jpg" $.Site.BaseURL) -}}
{{ end -}}
```

New code:
```go-html-template
{{ $ogImage := "" -}}
{{ with .Resources.GetMatch "cover.*" -}}
  {{ $processed := .Process "fill 1200x630 center jpg q85" -}}
  {{ $ogImage = $processed.Permalink -}}
{{ else -}}
  {{ $ogImage = (printf "%sog-default.jpg" $.Site.BaseURL) -}}
{{ end -}}
```

**Why JPEG for OG, not WebP/AVIF**: Many social media crawlers (Facebook, LinkedIn, Slack, iMessage) don't reliably support WebP/AVIF in `og:image` meta tags. JPEG is universally supported. The `fill 1200x630` produces exactly the recommended OG image dimensions with `center` crop anchor.

No change needed for the `<meta>` tags themselves — they already reference `{{ $ogImage }}`.

### 4. Updated JSON-LD Image

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/layouts/partials/json-ld.html`

Replace the image block (around lines 35–38). Current code:
```go-html-template
  {{- $cover := .Resources.GetMatch "cover.*" -}}
  {{- with $cover }},
  "image": "{{ .Permalink }}"
  {{- end }}
```

New code:
```go-html-template
  {{- $cover := .Resources.GetMatch "cover.*" -}}
  {{- with $cover -}}
    {{- $processed := .Process "fill 1200x630 center jpg q85" -}},
  "image": "{{ $processed.Permalink }}"
  {{- end }}
```

Same reasoning as OG — JSON-LD `image` should be universally consumable.

### 5. Markdown Image Render Hook

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/layouts/_default/_markup/render-image.html`

This directory does not exist yet — create `_markup/` under `_default/`.

This is a **forward-looking** addition. Currently no blog posts use inline Markdown images (`![alt](file.png)` — verified by grep), but when they do, this hook ensures they go through the same optimization pipeline.

```go-html-template
{{- $img := .Page.Resources.GetMatch .Destination -}}
{{- if $img -}}
  {{/* Page resource — process through responsive pipeline */}}
  {{ partial "responsive-image.html" (dict "image" $img "alt" (.Text | default "") "loading" "lazy") }}
{{- else -}}
  {{/* External URL or not a page resource — render plain img */}}
  <img src="{{ .Destination | safeURL }}" alt="{{ .Text }}"{{ with .Title }} title="{{ . }}"{{ end }}>
{{- end -}}
```

**Behavior**: If the image path matches a page bundle resource, it gets full AVIF/WebP/responsive treatment. External URLs (e.g., `https://...`) pass through as plain `<img>` tags.

### 6. CSS Update for `<picture>` Element

**Path**: `/Users/del-boy/src/bojan.delic.rs/themes/minimal/assets/css/article.css`

The current CSS targets `.article-cover img` and `.article-content img`. Since `<picture>` wraps the `<img>`, existing selectors still apply. However, add rules to ensure `<picture>` doesn't introduce unexpected layout behavior.

After the existing `.article-cover img` block (around line 19), add:
```css
.article-cover picture {
  display: contents;
}
```

After the existing `.article-content img` block (around line 108), add:
```css
.article-content picture {
  display: contents;
}
```

`display: contents` makes the `<picture>` element invisible to the layout engine — only its `<img>` child participates in the flow. This ensures zero visual change from wrapping images in `<picture>`.

## Integration Points

| System | How it connects | Changes needed |
|--------|----------------|----------------|
| Hugo image processing pipeline | Uses `.Process` method on image resources. Caches in `resources/_gen/`. | None — built-in |
| Hugo extended | Required for AVIF and WebP encoding. | None — already `extended` in local install and CI |
| Page bundles | Cover images stored as `content/blog/<slug>/cover.*`. Pattern `.Resources.GetMatch "cover.*"` is established. | None — same pattern |
| `hugo.toml` config | No image processing config needed; options specified inline in templates. | None |
| CI/CD (`.github/workflows/deploy.yml`) | Uses `hugo --minify` with extended. Build will take slightly longer (~5s) for image processing. | None |
| `.gitignore` | Already contains `resources/_gen/`. | None |

## Implementation Order

- [x] **Step 1**: Create `themes/minimal/layouts/partials/responsive-image.html`
  - This is the core component; everything else depends on it
  - Include a comment at top noting Hugo extended requirement

- [x] **Step 2**: Update `themes/minimal/layouts/_default/single.html`
  - Replace raw `<img>` with partial call for cover images
  - Use `loading="eager"` and `fetchpriority="high"` for above-the-fold cover
  - Verify with `hugo server --buildDrafts` — inspect HTML output for `<picture>` elements

- [x] **Step 3**: Update `themes/minimal/assets/css/article.css`
  - Add `display: contents` rules for `.article-cover picture` and `.article-content picture`
  - Verify no visual change to cover image rendering

- [x] **Step 4**: Update `themes/minimal/layouts/partials/head.html`
  - Process cover image for OG/Twitter meta tags as JPEG `1200x630`
  - Verify with View Source that `og:image` points to a processed URL under `resources/`

- [x] **Step 5**: Update `themes/minimal/layouts/partials/json-ld.html`
  - Process cover image for structured data (same JPEG 1200x630 as OG)
  - Verify JSON-LD `"image"` field in page source

- [x] **Step 6**: Create `themes/minimal/layouts/_default/_markup/render-image.html`
  - Create the `_markup/` directory
  - Markdown image render hook for future inline images
  - Test by temporarily adding `![test](cover.jpg)` to a blog post body, then revert

- [x] **Step 7**: Final verification
  - Run `hugo server --buildDrafts` and check both blog posts with covers:
    - `content/blog/hello-world/` (has `cover.jpg`, ~1.4MB)
    - `content/blog/building-this-website/` (has `cover.png`, ~2.1MB)
  - Inspect `resources/_gen/images/` to confirm WebP/JPEG variants are generated
  - Check page weight in browser DevTools Network tab
  - Verify `<picture>` elements in DOM inspector
  - Clean build test: `rm -rf resources/_gen public && hugo` to confirm full regeneration works

## Error Handling

| Scenario | Handling |
|---|---|
| **Source image narrower than breakpoint** | Hugo's `resize` won't upscale — returns original width. `srcset` still works correctly; browser picks best available. |
| **Unsupported input format (e.g., animated GIF)** | Hugo's `.Process` uses the first frame of animated GIFs. This is acceptable for covers. Document if needed. |
| **No cover image on a post** | The `{{ with $cover }}` guard already handles this in all templates — no `<picture>` rendered, OG falls back to `og-default.jpg`. No change needed. |
| **External images in Markdown** | The render hook falls back to plain `<img>` for non-resource URLs. |
| **Hugo non-extended build** | Would fail on AVIF/WebP encoding. Mitigated: already `extended` everywhere. Comment in partial documents requirement. |

## Testing Strategy

1. **Visual inspection**: `hugo server --buildDrafts`, visit both blog posts, confirm cover images display identically to before
2. **HTML source inspection**: View source, confirm `<picture>` elements contain three children: AVIF `<source>`, WebP `<source>`, fallback `<img>`
3. **Responsive srcset**: Confirm each `<source>` has `srcset` with 480w, 800w, 1200w entries
4. **Network tab**: DevTools → Network → Img filter. Confirm browser downloads AVIF (Chrome/Firefox) or WebP. Compare file sizes to originals (~1.4MB and ~2.1MB should drop dramatically).
5. **OG validation**: View source, confirm `og:image` and `twitter:image` meta tags point to a `_gen`-processed JPEG URL with dimensions in the path
6. **Mobile responsive**: DevTools responsive mode at 375px width — confirm a smaller image variant is loaded (check Network tab)
7. **Clean build**: `rm -rf resources/_gen public && hugo --minify` — should complete without errors
8. **Render hook**: Temporarily add `![Test image](cover.jpg)` in a blog post body, confirm it renders as `<picture>`, then revert the change

## Decision Points

| Decision | Choice | Reasoning |
|---|---|---|
| **Image formats** | AVIF + WebP + original fallback | AVIF gives best compression (~50–70% smaller than JPEG), WebP is the safe middle ground (~97% browser support), original fallback for the remaining ~3% |
| **Breakpoints** | 480, 800, 1200px | Covers mobile, tablet, desktop. Site's max content width is ~800px, so 1200px handles retina. More breakpoints add build time with diminishing returns. |
| **OG image format** | JPEG (not WebP/AVIF) | Social crawlers don't reliably support modern formats. JPEG is universal for `og:image`. |
| **OG image dimensions** | 1200×630 with `fill center` | Standard recommendation for Facebook/Twitter/LinkedIn. `fill` with `center` anchor handles cropping. |
| **Quality settings** | AVIF q75, WebP q80, JPEG q85 | Balanced defaults. AVIF is efficient at lower q; WebP and JPEG need slightly higher. |
| **Cover loading strategy** | `eager` + `fetchpriority="high"` | Cover is above the fold; lazy loading would delay LCP. |
| **Inline images loading** | `lazy` | Inline images in post body are typically below the fold. |
| **Generated files** | Gitignored, regenerated each build | `resources/_gen/` is already in `.gitignore`. Keeps repo clean. Hugo caching makes local rebuilds fast; CI adds <5s. |
| **Inline images** | Render hook, not shortcode | Transparent to content authors — standard `![alt](file)` syntax just works. No special shortcode to learn. |

### Rejected Approaches

1. **External image optimization (Cloudflare Polish, imgproxy, Cloudinary)** — Rejected. Hugo handles it natively at build time with zero runtime cost and no external dependencies or API keys.
2. **npm-based optimization (sharp, imagemin)** — Rejected. Hugo extended handles AVIF/WebP encoding natively. Adding npm image tools would complicate the build pipeline for no benefit.
3. **Only WebP without AVIF** — Considered but rejected. AVIF's ~30–50% size advantage over WebP is significant, browser support is at ~93%, and adding one more `<source>` line is trivial.
4. **Committing `resources/_gen/` to git** — Rejected to keep the repo clean. A few seconds of CI build time is a worthwhile tradeoff.
5. **Custom `img` shortcode instead of render hook** — Rejected. A render hook is invisible to content authors; standard Markdown image syntax works automatically. A shortcode would require remembering custom syntax.

## Future Enhancements

- **Blog list thumbnails**: If the list page ever shows cover thumbnails, add a small variant (e.g., 200px) via a `maxwidth` parameter to the responsive partial
- **Art direction**: Different crops for mobile vs desktop using `<source media="...">` queries in `<picture>`
- **Blur-up placeholder**: Generate a tiny (20px wide) blurred version as inline base64 `background-image` for progressive loading effect
- **Image dimension validation**: CI check that warns if source cover images are smaller than 1200px wide
- **Auto-generated OG images**: For posts without cover images, generate a text-based OG image using Hugo's `images.Text` filter (available since Hugo 0.126+)

## Implementation Progress

**Completed 2026-02-13.**

All steps implemented successfully. Key deviation from plan:

- **AVIF dropped**: `hugo env` confirmed that Hugo extended v0.155.3 includes `libwebp v1.6.0` but does NOT include an AVIF encoder. The `avif` format parameter in `.Process` was silently ignored, producing JPEG files with incorrect `type="image/avif"` source tags. The partial was updated to use **WebP + original fallback only** (no AVIF source). This still achieves excellent compression:
  - `hello-world/cover.jpg`: 1.4MB → 36KB WebP (97% reduction)
  - `building-this-website/cover.png`: 2.1MB → 60KB WebP (97% reduction)
- 10 processed images total (3 WebP sizes + 1 fallback per cover × 2 posts + 2 OG JPEGs)
- Clean build completes in ~1.6s
- OG/Twitter images correctly processed as JPEG 1200×630
- JSON-LD `image` fields point to processed JPEGs
- `<picture>` elements verified in HTML output with correct `type` attributes
- Render hook created for future inline Markdown images
