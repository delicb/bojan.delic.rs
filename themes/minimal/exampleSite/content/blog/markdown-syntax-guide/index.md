---
title: "Markdown Syntax Guide"
date: 2025-01-10
description: "A showcase of all the Markdown and Hugo elements supported by this theme — headings, text formatting, lists, code blocks, tables, images, and more."
tags: ["markdown", "syntax", "demo"]
---

This post demonstrates all the Markdown and Hugo-specific elements styled by the Minimal theme. Use it as a reference when writing content.

## Headings

The headings above and below are `h2` elements. The title of each post is an `h1`.

### Third-Level Heading

#### Fourth-Level Heading

##### Fifth-Level Heading

###### Sixth-Level Heading

## Paragraphs

Xerum, currentium in venbn reprehen deam, currentium eam que voleli diede veleli id, currentium of nobitatur sedita voles est voeli bla aspeli sandaede ligede voleritam, currentium endit, currentium of omit lam. Sendicate voluptates to exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

A second paragraph. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Text Formatting

- **Bold text** using `**double asterisks**`
- *Italic text* using `*single asterisks*`
- ***Bold and italic*** using `***triple asterisks***`
- ~~Strikethrough~~ using `~~tildes~~`
- `Inline code` using `` `backticks` ``
- [A hyperlink](https://gohugo.io) using `[text](url)`
- A footnote reference[^1] using `[^1]`

[^1]: This is the footnote content. It appears at the bottom of the page.

## Blockquotes

> This is a blockquote. It can span multiple lines and is commonly used for pull quotes or citations.
>
> — Someone wise

Nested blockquotes:

> First level
>
> > Second level
> >
> > > Third level

## Lists

### Unordered List

- Item one
- Item two
  - Nested item A
  - Nested item B
    - Deeply nested
- Item three

### Ordered List

1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
3. Third item

### Task List

- [x] Write the theme
- [x] Add dark mode
- [ ] World domination

## Code

### Inline Code

Use the `fmt.Println()` function. Set the variable `maxRetries` to `3`. The config file is at `/etc/app/config.yaml`.

### Code Block

```go
package main

import "fmt"

func main() {
    for i := range 5 {
        fmt.Printf("Hello #%d\n", i+1)
    }
}
```

### Code Block with Line Numbers

```go {linenos=table}
package main

import (
    "log"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, world!"))
    })
    log.Fatal(http.ListenAndServe(":8080", nil))
}
```

### Code Block with Highlighted Lines

```python {linenos=table,hl_lines=[3,5]}
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

for num in fibonacci(10):
    print(num)
```

### Various Languages

**JavaScript:**

```javascript
const greet = (name) => `Hello, ${name}!`;
console.log(greet("world"));
```

**Bash:**

```bash
#!/bin/bash
for file in *.md; do
    echo "Processing $file"
    wc -w "$file"
done
```

**YAML:**

```yaml
server:
  host: 0.0.0.0
  port: 8080
  tls:
    enabled: true
    cert: /etc/ssl/cert.pem
```

**HTML:**

```html
<details>
  <summary>Click to expand</summary>
  <p>Hidden content goes here.</p>
</details>
```

## Tables

| Feature         | Supported | Notes                      |
| --------------- | :-------: | -------------------------- |
| Light mode      |    ✅     | Default                    |
| Dark mode       |    ✅     | Toggle or OS preference    |
| Responsive      |    ✅     | Mobile-first               |
| RSS             |    ✅     | Per-section feeds           |
| Syntax highlighting |  ✅  | Chroma, 200+ languages     |

### Right-Aligned Numbers

| Language   | Stars | Year |
| ---------- | ----: | ---: |
| Go         | 124k  | 2009 |
| Rust       | 98k   | 2010 |
| TypeScript | 101k  | 2012 |

## Horizontal Rule

Content above the line.

---

Content below the line.

## Images

Here's a placeholder to show how images render. In a real post, place images in the page bundle folder alongside `index.md`:

![A sample image](https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop "Code on a screen")

## Definition Lists

Hugo/Goldmark supports definition lists:

Hugo
: A fast static site generator written in Go.

Markdown
: A lightweight markup language for creating formatted text.

Theme
: A collection of templates, styles, and assets that define the look of a site.

## Abbreviations

The <abbr title="Hyper Text Markup Language">HTML</abbr> specification is maintained by the <abbr title="World Wide Web Consortium">W3C</abbr>. Hover over the abbreviations to see their full forms.

## Embedded HTML

Hugo allows raw HTML in Markdown when `unsafe` mode is enabled:

<div style="padding: 1em; border-left: 3px solid currentColor; opacity: 0.8;">
  <strong>Note:</strong> This is raw HTML embedded in Markdown. The theme's <code>hugo.toml</code> enables this with <code>unsafe = true</code>.
</div>

## Long Content Test

This section tests how the theme handles longer bodies of text with mixed elements.

Building a personal website is one of those projects that's *never truly finished*. You tweak the colours, adjust the spacing, rewrite the bio, and before you know it you've spent more time on the site than on the content it's supposed to showcase. The trick is to **pick a design you're happy with and start writing**.

> The perfect is the enemy of the good.
>
> — Voltaire

Here's a quick checklist for launching:

1. Choose a static site generator (Hugo, of course)
2. Pick or build a theme
3. Write at least one real post
4. Set up deployment
5. Share it with the world

And a code snippet to tie it all together:

```bash
hugo new content/blog/my-first-post/index.md
hugo server --buildDrafts
# Write, preview, repeat
hugo --minify && deploy
```

That's it — you're live. 🚀
