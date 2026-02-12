---
title: "Building This Website"
date: 2026-02-11
description: "Rebuilding my personal site from scratch with Hugo and a custom theme, using Pi coding agent to do the heavy lifting."
tags: ["hugo", "web", "meta", "ai"]
draft: true
---

My previous personal website was a Hugo site with a stock theme that I set up once and never really touched again. It worked, but it felt like it belonged to someone else. I wanted to rebuild it from scratch with a custom theme and proper modern web practices. Also, riding on AI hype, instead of writing all the code and config files myself, I'd use [Pi](https://github.com/mariozechner/pi-coding-agent), an AI coding agent for the terminal, and see how far I could get by describing what I want and steering the implementation.

Turns out, pretty far.

## The Stack

[Hugo](https://gohugo.io) was the obvious choice. It's fast, it's a single binary, and I already knew the basics. The goal was a personal site with four sections: blog, projects, resume, and quotes. No JavaScript frameworks. No build tools beyond Hugo itself. Deploys to [Cloudflare Pages](https://pages.cloudflare.com/) via GitHub Actions.

The entire process took a couple of evening sessions. Most of my time went into reviewing output and making decisions. The agent handled the implementation.

## Custom Theme from Scratch

The previous stock theme had to go. I wanted full control, so the agent built a custom theme under `themes/minimal/`. The CSS architecture ended up clean. Six focused files (`base.css`, `layout.css`, `article.css`, `sections.css`, `responsive.css`, `syntax.css`) that Hugo Pipes concatenates and fingerprints into a single output file at build time.

Design tokens live as CSS custom properties in `base.css`. The entire color scheme, spacing, and typography can be adjusted by tweaking a handful of variables. Light and dark mode is just swapping those properties, with the toggle being the only JavaScript on the site. It reads the OS preference on first visit, allows manual override, and persists the choice in localStorage.

## Data-Driven Sections

Rather than creating individual content pages for projects, resume, and quotes, these sections are driven by YAML files in `data/`. The projects page reads from `data/projects.yaml`:

```yaml
- name: ligno
  url: https://github.com/delicb/ligno
  description: Logging library for Go
  tech: [Go]
  featured: true

- name: slogbuffer
  url: https://github.com/delicb/slogbuffer
  description: Buffer handler for slog
  tech: [Go]
```

Projects marked `featured: true` render as larger cards in a responsive grid at the top of the page. Everything else shows up as a compact list below. Promoting or demoting a project is a one-line YAML change.

Resume and quotes work the same way. The templates iterate over data files, so there's zero duplication between content and presentation.

## Blog Features

The blog accumulated features across several iterations:

**Pagination** uses Hugo's built-in `.Paginate` with 10 posts per page. The list layout went through a revision after the first version placed the date awkwardly in the middle of each row. In the final version, the title and reading time are stacked on the left, with the date pushed to the right.

**Reading time** uses Hugo's `.ReadingTime` variable. It shows up on both single posts and the list page.

**Cover images** are convention-based. Drop a `cover.*` file into a post's page bundle directory and the template picks it up automatically via `.Resources.GetMatch "cover.*"`. No front matter configuration needed.

**The include shortcode** was the most interesting piece. I wanted to embed code from actual files in a post's directory, not just inline code blocks. The agent built `themes/minimal/layouts/shortcodes/include.html` with support for line ranges, line numbers, and line highlighting:

```text
{{</* include file="setup.py" lines="11-27" linenos="table" hl="19-20" */>}}
```

The tricky part was line highlighting. The `hl` parameter takes original file line numbers, but Hugo's `highlight` function expects line numbers relative to the displayed block. So if you're showing lines 11-27 and want to highlight line 19, the shortcode translates that to line 9 internally. This took a few iterations to get right. The agent's first implementation didn't account for the offset, and the highlighted lines were wrong. After I pointed it out, it fixed the translation logic and it's worked since.

Language detection is automatic from the file extension, with an optional `lang` parameter for overrides.

## SEO and Meta

At one point I asked the agent to fetch the live version of the old site and compare it to the new implementation. It found a whole list of gaps. No favicons. No Open Graph tags. No RSS feed. No canonical URLs, no sitemap, no structured data.

I pointed the agent at a photo in my Downloads folder and it generated favicons in all standard sizes (16, 32, 180, 192, 512px, plus `.ico`) using `sips` and ImageMagick. The same photo became the default Open Graph image.

The `<head>` partial now includes Open Graph and Twitter Card tags generated from each page's front matter, with blog posts using their cover image when available. There's JSON-LD structured data as well. The homepage gets a `Person` schema with `sameAs` links to GitHub, LinkedIn, and X, while articles get a `BlogPosting` schema. Canonical URLs are on every page. RSS is enabled for the blog section with auto-discovery via `<link rel="alternate">`, and the sitemap is auto-generated by Hugo. I also added a font preconnect hint for the cdnjs CDN to shave off some DNS/TLS time on first load.

## Security and Headers

Cloudflare Pages supports a `_headers` file for setting HTTP response headers. The agent created `static/_headers` with some basic security hardening.

```text
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

A `security.txt` file went into `static/.well-known/` following RFC 9116, with contact email and an expiry date that needs annual renewal.

For analytics, I went with Cloudflare Web Analytics over Google Analytics. It's free, doesn't require cookies, and since the site is already on Cloudflare, enabling it is just a toggle in the dashboard. No code changes, no tracking scripts.

## Deployment

The CI pipeline is a straightforward GitHub Actions workflow. Checkout, build with `hugo --minify`, deploy to Cloudflare Pages via Wrangler. Maybe ~50 lines of YAML total.

The Cloudflare API token only needs the `Account > Cloudflare Pages > Edit` permission. The agent initially suggested using the "Edit Cloudflare Workers" template, which bundles a bunch of unnecessary permissions. When I questioned it while setting up the token, it confirmed the minimal scope was sufficient. Small thing, but this is exactly the kind of detail where having a human in the loop matters.

## Contact Form

The contact page turned out to be the most frustrating feature to ship. The idea was simple: a form that sends me an email, protected from bots. Cloudflare Pages Functions handle the backend, so the form submits to a TypeScript function at `/api/contact` that forwards the message via Resend's API. A honeypot field catches dumb bots, and Cloudflare Turnstile handles the rest.

Except Turnstile didn't work. For hours. The widget rendered fine, tokens were generated, but every single verification request came back with `invalid-input-response`. I rotated keys, recreated the widget, triple-checked the secret, logged everything. The agent and I went through every possible cause: wrong secret, wrong domain, Bot Fight Mode, token encoding issues. We rewrote the verification logic from scratch, tried inlining it instead of using the middleware, compared headers and payloads. Nothing worked. Eventually, in desperation, we switched to the official `@cloudflare/pages-plugin-turnstile` package, which handles verification as middleware before the request even hits the function. That worked. We tried reverting to the manual approach to isolate the root cause, and it broke again. So the plugin stayed.

I'm still not entirely sure what was wrong with the manual implementation. The plugin does essentially the same thing, just packaged differently. It might have been a subtle issue with how the form data was being consumed before the token could be verified, or some Cloudflare-internal behavior the plugin accounts for. Either way, it works now, and I've accepted that some debugging sessions end with "it works, don't touch it" rather than a satisfying root cause.

## Working with a Coding Agent

The entire site was built through Pi, a terminal-based coding agent, using Opus 4.6. Pi is turning out to be way more enjoyable than Claude Code. I really dig the minimalism and self-improvement flow (e.g. asking it to create its own extensions and skills). The workflow was conversational - I described what I wanted, the agent implemented it, I reviewed and either approved or redirected.

Some things landed perfectly on the first try. The data-driven sections, the deployment pipeline, the security headers. These are well-understood patterns with clear requirements.

Other things needed iteration. The include shortcode's line highlighting was wrong on the first pass. The blog list layout needed a redesign after the initial version didn't look right. The `_headers` file syntax confused me because `/*` looks like an unclosed comment, and the agent explained it's actually a URL wildcard pattern in Cloudflare's config format. I never used `_headers` so this is something I learned along the way. 

There were also moments where the agent proactively caught things I hadn't thought about. When it fetched the old site to compare, it identified six missing features I would have shipped without. When I asked about adding a homepage photo, it laid out pros and cons and I decided against it. When it suggested Google Analytics, I asked about alternatives and it pointed me to Cloudflare's built-in analytics.

A clear pattern emerged. I make decisions, the agent does implementation. I'm not reviewing every line of CSS it generates, and honestly I could not even if I wanted to since I never bothered to learn CSS properly. But I am deciding what the site should have, how it should behave, and when something doesn't look right. The tedious parts like generating six favicon sizes, writing JSON-LD schemas, or handling pagination edge cases would have slowly drained my motivation if I'd been doing them by hand. The agent knocked those out in seconds.

I don't think I would have shipped a site with this level of polish in two evenings on my own. Not because any individual feature is complex, but because the sheer number of small tasks adds up. Having an agent that can knock out each one in seconds while I focus on the bigger picture made the whole process genuinely enjoyable.

The source is [on GitHub](https://github.com/delicb/bojan.delic.rs) if you want to look at the result.
