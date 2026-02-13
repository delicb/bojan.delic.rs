# Minimal — A Hugo Theme

A clean, minimal Hugo theme for personal websites. Supports a blog, resume, projects, quotes, and contact page — all driven by simple configuration and YAML data files.

![Hugo](https://img.shields.io/badge/Hugo-%3E%3D0.128-ff4088?logo=hugo)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- **8 accent color palettes** — green (default), blue, indigo, teal, red, orange, purple, rose — one line of config
- **Light / dark mode** — follows OS preference, with a manual toggle that persists via `localStorage`
- **Responsive design** — mobile-first, looks great on all screen sizes
- **Responsive images** — automatic WebP generation with `<picture>` srcsets (requires Hugo Extended)
- **Blog** with cover images, reading time, pagination, and RSS
- **Resume** section driven by `data/resume.yaml`
- **Projects** section driven by `data/projects.yaml` with featured cards
- **Quotes** section driven by `data/quotes.yaml`
- **Contact form** with Cloudflare Turnstile anti-bot protection
- **SEO** — Open Graph, Twitter Cards, JSON-LD, canonical URLs, sitemap
- **Syntax highlighting** — Chroma-based with line numbers, line highlighting, and light/dark styles
- **Self-hosted fonts & icons** — no external CDN dependencies
- **Minimal JavaScript** — only used for theme toggle, back-to-top, and scroll reveal
- **Print styles** included

## Requirements

- **Hugo Extended** ≥ 0.128.0 (needed for WebP image processing and CSS pipes)

## Installation

### As a git submodule (recommended)

```bash
git submodule add https://github.com/delicb/hugo-theme-minimal.git themes/minimal
```

### Manual download

Download the theme and place it in `themes/minimal/`.

Then set the theme in your `hugo.toml`:

```toml
theme = 'minimal'
```

## Quick Start

Copy the example site to get started fast:

```bash
cp -r themes/minimal/exampleSite/* .
```

Then run:

```bash
hugo server
```

## Configuration

### Site Config (`hugo.toml`)

```toml
baseURL = 'https://example.com/'
languageCode = 'en-us'
title = 'Your Name'
theme = 'minimal'

[params]
  tagline = 'Your tagline here'
  description = 'Site description for SEO'
  email = 'you@example.com'
  twitterHandle = '@yourhandle'
```

### Required Markup Settings

Hugo does not merge `[markup]` config from themes, so you **must** add this to your site's `hugo.toml`. The theme's syntax highlighting CSS depends on it:

```toml
[markup]
  [markup.highlight]
    noClasses = false
    codeFences = true
    lineNumbersInTable = true
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
```

### Social Links

```toml
[[params.socialLinks]]
  name = "GitHub"
  url = "https://github.com/yourname"
  icon = "github"

[[params.socialLinks]]
  name = "LinkedIn"
  url = "https://www.linkedin.com/in/yourname/"
  icon = "linkedin"
```

Available icons: `github`, `linkedin`, `x-twitter`, `envelope`, `rss`, `arrow-up`. To add more, place an SVG file in `assets/icons/` and reference it by filename (without `.svg`).

### Home Page Cards

```toml
[[params.homeCards]]
  title = "Blog"
  description = "Thoughts and tutorials."
  url = "/blog/"
```

### Navigation Menu

```toml
[[menus.main]]
  name = "Blog"
  url = "/blog/"
  weight = 1
```

## Content Structure

```
content/
├── _index.md              # Home page
├── blog/
│   ├── _index.md          # Blog list page
│   └── my-post/
│       ├── index.md       # Post content (page bundle)
│       └── cover.jpg      # Optional cover image
├── projects/
│   └── _index.md          # Projects list (data from data/projects.yaml)
├── resume/
│   └── _index.md          # Resume page (data from data/resume.yaml)
├── quotes/
│   └── _index.md          # Quotes page (data from data/quotes.yaml)
└── contact/
    └── index.md           # Contact form (set layout: "contact" in front matter)
```

### Blog Posts

Blog posts use **page bundles** — each post is a folder with an `index.md` file. Place images and other assets in the same folder.

Front matter:

```yaml
---
title: "My Post"
date: 2025-01-15
description: "A short summary."
tags: ["go", "tutorial"]
draft: false
---
```

Add a `cover.jpg` (or `cover.png`, `cover.webp`) to the post folder to display a cover image.

### Data Files

#### `data/projects.yaml`

```yaml
- name: "Project Name"
  url: "https://github.com/..."
  description: "What it does."
  tech: ["Go", "Docker"]
  featured: true  # Shows as a prominent card
```

#### `data/resume.yaml`

```yaml
summary: "Brief professional summary."

skills:
  - category: "Languages"
    items: "Go, Python, JavaScript"

experience:
  - company: "Acme Corp"
    location: "Remote"
    roles:
      - title: "Senior Engineer"
        start_date: 2022-03-01
        end_date: present
        highlights:
          - "Led architecture redesign"

education:
  - degree: "B.Sc. Computer Science"
    school: "University"
    period: "2009 – 2013"
```

#### `data/quotes.yaml`

```yaml
- text: "Simplicity is the ultimate sophistication."
  author: "Leonardo da Vinci"
  source: ""  # Optional
```

## Shortcodes

### `include`

Render code from a file in the page bundle with syntax highlighting:

```
{{</* include file="example.go" */>}}
{{</* include file="main.py" lines="5-12" hl="7 9-10" linenos="table" */>}}
```

Parameters:
- `file` — filename in the page bundle (required)
- `lang` — language override (auto-detected from extension)
- `lines` — line range to display, e.g. `"5-12"`
- `hl` — lines to highlight (uses original file line numbers)
- `linenos` — `"table"` or `"inline"`

## Customization

### Accent Color

Set `accentColor` in your site params to change the theme's primary color. Green is the default.

```toml
[params]
  accentColor = "blue"
```

Available colors: `green` (default), `blue`, `indigo`, `teal`, `red`, `orange`, `purple`, `rose`.

The chosen color applies to links, accents, tags, and the top border — in both light and dark modes.

### CSS Custom Properties

The theme uses CSS custom properties for colors, fonts, and spacing. Override them in your own CSS file or by placing a `assets/css/custom.css` in your site.

Key properties are defined in `assets/css/base.css` under `:root` and `[data-theme="dark"]`.

### Adding Icons

1. Download an SVG from [Font Awesome Free](https://github.com/FortAwesome/Font-Awesome/tree/6.x/svgs)
2. Save it to `assets/icons/<name>.svg` (in your site, not the theme — Hugo's asset pipeline merges both)
3. Use in templates: `{{ partial "icon.html" (dict "name" "<name>") }}`

## Theme Defaults

The theme ships sensible defaults in its own `hugo.toml` for:

- Syntax highlighting (CSS classes, code fences enabled)
- Markdown rendering (unsafe HTML allowed)
- Pagination (10 items per page)
- Output formats (HTML + RSS for home and sections)
- Blog section name and JSON-LD type

Your site's `hugo.toml` overrides any of these.

## License

MIT — see [LICENSE](LICENSE).
