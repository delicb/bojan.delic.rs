---
name: new-blog-post
description: Create a new blog post for the Hugo site. Asks the user for a post title and scaffolds the markdown file in the correct page bundle location ready for writing.
---

# New Blog Post

Interactive skill for scaffolding a new blog post. Follow these steps in order.

## Step 1: Get Post Title

If the user didn't provide a title in their message, ask them:

> What's the title for your new blog post?

Wait for their response before continuing.

## Step 2: Generate Slug and Paths

Derive the slug from the title:
- Lowercase
- Replace spaces and special characters with hyphens
- Remove consecutive hyphens
- Strip leading/trailing hyphens

```
Title: "Building CLI Tools in Go"
Slug:  "building-cli-tools-in-go"
Path:  content/blog/building-cli-tools-in-go/
File:  content/blog/building-cli-tools-in-go/index.md
```

Check if the directory already exists. If it does, inform the user and ask how to proceed.

## Step 3: Create the Post

Create the directory and markdown file:

```bash
mkdir -p content/blog/<slug>
```

Write `content/blog/<slug>/index.md` with this template:

```markdown
---
title: "<title>"
date: <YYYY-MM-DD>
description: ""
tags: []
draft: true
---

<!-- Start writing your post here -->
```

Use today's date. Leave `description` and `tags` empty for the author to fill in.

## Writing Style Rules

When writing or editing blog post content, follow these rules:

- **No em-dashes or en-dashes.** Use commas, periods, or restructure the sentence instead.
- **Avoid colons mid-sentence as list introductions.** Don't write "The result was: X, Y, Z." Rewrite as flowing prose or separate sentences.
- **Vary sentence length.** Mix short punchy sentences with longer explanatory ones. Don't fall into a rhythm where every sentence is the same length.
- **Sound human, not like LLM-generated text.** Avoid formulaic phrasing, excessive hedging, or overly polished corporate tone.

## Step 4: Confirm

Tell the user:
- The file path that was created
- That the post is marked as `draft: true` (won't appear in production builds, visible with `hugo server --buildDrafts`)
- Remind them to fill in `description` and `tags`
- They can optionally add a cover image by placing a `cover.jpg` (or `.png`, `.svg`, `.webp`) in the post's directory — the template picks it up automatically
- If the Hugo dev server is running, they can preview immediately at `http://localhost:1313/blog/<slug>/`
