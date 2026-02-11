---
name: hugo-dev
description: Develop and preview Hugo static sites. Use when editing Hugo templates, content, CSS, or config. Covers starting the dev server, live preview workflow, content creation, theme development, and building for production.
---

# Hugo Development

## Dev Server

Always start the Hugo dev server in the background before making changes, so the user can see updates live in their browser.

### Start Server

```bash
# Kill any existing Hugo server first
pkill -f 'hugo server' 2>/dev/null || true
sleep 1

# Start in background, fully detached
cd <project-root>
: > /tmp/hugo-server.log
nohup hugo server --buildDrafts --bind 0.0.0.0 -p 1313 &>/tmp/hugo-server.log & disown

# Poll for startup (don't use grep -m1 or tail -f — they block)
for i in $(seq 1 10); do
  if grep -q 'Web Server is available' /tmp/hugo-server.log 2>/dev/null; then
    echo "Hugo dev server running at http://localhost:1313/"
    break
  fi
  sleep 0.5
done
```

**Important**: Always use `nohup ... & disown` and poll with a `for` loop. Do NOT use `grep -m1` or `tail -f` to wait — they block the terminal.

Tell the user the site is available at **http://localhost:1313/** after starting.

### Check Server Status

```bash
pgrep -f 'hugo server' && echo "Running" || echo "Not running"
```

### View Server Logs (if something looks wrong)

```bash
tail -20 /tmp/hugo-server.log
```

### Stop Server

```bash
pkill -f 'hugo server' 2>/dev/null
```

## Live Workflow

Hugo's dev server watches for file changes and automatically rebuilds. The workflow is:

1. Start the dev server (see above)
2. Make changes to templates, content, CSS, or config
3. Changes appear in the browser automatically (Fast Render Mode)
4. If changes don't appear (e.g. config changes), restart the server

**Note**: Changes to `hugo.toml` require a server restart. Template and content changes are picked up automatically.

## Content

### Create a New Blog Post

Blog posts use page bundles for co-located images:

```bash
mkdir -p content/blog/<slug>
```

Then create `content/blog/<slug>/index.md`:

```markdown
---
title: "Post Title"
date: YYYY-MM-DD
description: "Brief summary for listings and meta tags."
tags: ["tag1", "tag2"]
draft: true  # Remove when ready to publish
---

Post content in Markdown...
```

Place post-specific images in the same directory as `index.md`.

### Data-Driven Sections

Projects, resume, and quotes are not individual content pages. They are driven by YAML data files:

- `data/projects.yaml` — project entries (name, url, description, tech)
- `data/resume.yaml` — experience, education, skills
- `data/quotes.yaml` — quote entries (text, author, source)

Edit the YAML files to update these sections. The templates in `themes/minimal/layouts/<section>/list.html` render them.

## Theme Development

### File Locations

All theme files are in `themes/minimal/`:

```
themes/minimal/
├── assets/css/style.css      # ALL styling — edit this for design changes
├── layouts/
│   ├── _default/
│   │   ├── baseof.html       # Base template (html, head, body wrapper)
│   │   ├── list.html         # Default list page (blog index)
│   │   └── single.html       # Default single page (blog post)
│   ├── partials/
│   │   ├── head.html         # <head> contents (meta, CSS)
│   │   ├── header.html       # Site header + navigation
│   │   └── footer.html       # Site footer
│   ├── index.html            # Home page
│   ├── blog/                 # (uses _default/ templates)
│   ├── projects/list.html    # Projects listing
│   ├── quotes/list.html      # Quotes listing
│   └── resume/list.html      # Resume page
└── theme.toml
```

### CSS Architecture

`assets/css/style.css` uses CSS custom properties for all design tokens. To change the look:

- Edit `:root { ... }` for light mode colors
- Edit `@media (prefers-color-scheme: dark) { :root { ... } }` for dark mode
- Key variables: `--color-bg`, `--color-text`, `--color-accent`, `--color-link`, `--font-body`, `--font-mono`, `--max-width`, `--spacing`, `--radius`

### Override Without Modifying Theme

To override a template without changing the theme, copy it to the site-level `layouts/` directory with the same path:

```bash
# Example: override the footer
cp themes/minimal/layouts/partials/footer.html layouts/partials/footer.html
# Edit layouts/partials/footer.html — it takes precedence
```

Same for assets — site-level `assets/` overrides `themes/minimal/assets/`.

## Production Build

```bash
hugo --minify
```

Output goes to `public/`. This is the only command needed for CI/CD.

## Troubleshooting

- **Blank page**: Check `hugo.toml` has `theme = 'minimal'` and templates exist
- **CSS not updating**: Hard-refresh browser (Cmd+Shift+R) — Hugo fingerprints CSS
- **Template errors**: Check `tail -20 /tmp/hugo-server.log` for error messages
- **New section not appearing**: Ensure `content/<section>/_index.md` exists and a matching layout exists in `themes/minimal/layouts/<section>/`
