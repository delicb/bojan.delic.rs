---
name: blog-post-review
description: Review and proofread a blog post draft. Checks grammar, clarity, tone, structure, front matter completeness, and Hugo-specific issues. Use when the user wants feedback on a post before publishing.
---

# Blog Post Review

Review a blog post for quality before publishing. Follow all steps in order and present findings as a single consolidated report at the end.

## Step 1: Identify the Post

If the user didn't specify which post to review, list drafts:

```bash
grep -rl 'draft: true' content/blog/*/index.md
```

If there are multiple drafts, ask which one to review. If there's only one, use it. If there are no drafts, list recent posts and ask.

Read the full post content with the `read` tool.

## Step 2: Front Matter Check

Verify the front matter has:

- **title** — present and not placeholder text
- **date** — present and valid format (YYYY-MM-DD)
- **description** — present and not empty (used for meta tags and post listings; should be 1-2 sentences, under 160 characters for SEO)
- **tags** — present and not empty (at least one tag recommended)
- **draft** — note whether it's `true` or `false`; remind the user to set `false` when ready to publish

Flag anything missing or problematic.

## Step 3: Cover Image Check

Check if the post bundle contains a cover image:

```bash
ls content/blog/<slug>/cover.* 2>/dev/null
```

If missing, note it as optional but recommended for social sharing (Open Graph image falls back to the site default).

## Step 4: Content Review

Review the post body for:

### Grammar & Spelling
- Typos, misspellings, grammatical errors
- Subject-verb agreement
- Incorrect homophones (their/there/they're, its/it's, etc.)

### Clarity & Readability
- Sentences that are confusing or ambiguous
- Paragraphs that are too long (suggest breaking up if 5+ sentences)
- Jargon used without explanation (consider the target audience)
- Missing context or assumptions about reader knowledge

### Structure
- Logical flow from section to section
- Headings used appropriately (H2 for sections, H3 for subsections)
- Introduction sets up what the post is about
- Conclusion or clear ending (not just stopping abruptly)

### Tone & Style
- Consistent voice throughout
- Appropriate for a personal tech blog (conversational but informed)
- Flag any of these patterns (per the site's writing rules):
  - **Em-dashes or en-dashes** — should use commas, periods, or restructure instead
  - **Colons mid-sentence as list introductions** — rewrite as flowing prose
  - **Uniform sentence length** — should mix short and long sentences
  - **LLM-sounding text** — formulaic phrasing, excessive hedging, overly polished corporate tone

### Technical Accuracy
- Code blocks have correct language annotations (e.g., ` ```go `, ` ```python `)
- Commands or code snippets look syntactically correct
- Links are present where referencing external tools, libraries, or concepts

## Step 5: Hugo / Markdown Issues

Check for common problems:

- Broken shortcode syntax (e.g., `{{< include >}}` without required `file` param)
- Raw HTML that might not render (Hugo's default config may strip it)
- Image references that point to files not in the page bundle
- Relative links that won't resolve correctly

```bash
# Check for referenced files that don't exist in the bundle
grep -oP '!\[.*?\]\(\K[^)]+' content/blog/<slug>/index.md | while read f; do
  [ -f "content/blog/<slug>/$f" ] || echo "Missing: $f"
done
```

## Step 6: Present Report

Combine all findings into a single clear report with these sections:

```
## Review: "<Post Title>"

### Summary
One paragraph overall impression — is it ready to publish, needs minor tweaks, or needs significant work?

### Front Matter
- ✅ or ❌ for each field, with suggestions for missing/weak items

### Content Issues
List each issue with:
- Location (quote the relevant text or give the paragraph/heading)
- What the issue is
- Suggested fix

Group by severity:
1. **Must fix** — errors, broken content, misleading information
2. **Should fix** — clarity improvements, structural issues, style violations
3. **Consider** — minor suggestions, nitpicks, optional improvements

### Positive Notes
Call out 2-3 things the post does well (genuine, not filler).
```

If there are no issues in a category, say so briefly and move on. Don't pad the report.

## Important

- Be direct and specific. Don't soften feedback with excessive qualifiers.
- Provide concrete rewrites for any sentence you flag, not just "consider rephrasing."
- Don't rewrite the entire post. The author's voice should remain.
- If the post is solid, say so. A short review of a good post is fine.
