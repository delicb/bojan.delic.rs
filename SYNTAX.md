# Content Syntax Reference

Quick reference for syntax and features available when writing content (mostly blog posts).

---

## Cover Images

Blog posts can optionally have a cover image displayed as a full-width banner above the title. To add one, place a file named `cover.*` in the post's page bundle directory:

```
content/blog/my-post/
├── index.md
└── cover.jpg       ← automatically picked up
```

Supported formats: `.jpg`, `.png`, `.svg`, `.webp`

The template finds the image via Hugo page resources (`cover.*` glob) — no front matter or markdown needed. Posts without a cover image render normally.

Recommended dimensions: **1200×630px** (landscape). The image is displayed full-width and capped at 420px height with `object-fit: cover`.

---

## Code Blocks

### Basic

Plain fenced code block with syntax highlighting:

````markdown
```go
fmt.Println("hello")
```
````

### Line Numbers

Add `{linenos=table}` after the language to show line numbers. The `table` mode keeps numbers out of copy-paste selections.

````markdown
```go {linenos=table}
package main

func main() {
    fmt.Println("hello")
}
```
````

You can start numbering from a specific line with `linenostart`:

````markdown
```go {linenos=table,linenostart=42}
// This starts at line 42
```
````

### Line Highlighting

Highlight specific lines to draw attention to them. Works with or without line numbers.

````markdown
```go {hl_lines=[3]}
one
two
three   // ← this line highlighted
```
````

Ranges and multiple values:

````markdown
```go {hl_lines=[1,"3-5",9]}
// Highlights lines 1, 3 through 5, and 9
```
````

### Combined

Line numbers and highlighting together:

````markdown
```go {linenos=table,hl_lines=["5-7"]}
package main

import "fmt"

func main() {
    fmt.Println("hello")
}
```
````

### Hugo `highlight` Shortcode

For more control, use the built-in shortcode directly:

```text
{{< highlight go "linenos=table,hl_lines=3 5-7,linenostart=10" >}}
// code here
{{< /highlight >}}
```

Note: the shortcode uses space-separated `hl_lines` values (not arrays), and does not quote ranges.

---

## Attribute Reference

| Attribute      | Values          | Default | Description                          |
|----------------|-----------------|---------|--------------------------------------|
| `linenos`      | `table`, `inline`, `true`, `false` | `false` | Show line numbers. Prefer `table`.  |
| `hl_lines`     | `[1,"3-5",8]`  | —       | Lines or ranges to highlight         |
| `linenostart`  | integer         | `1`     | First line number                    |
| `anchorlinenos`| `true`, `false` | `true`  | Make line numbers clickable anchors  |

Hugo highlight docs: https://gohugo.io/content-management/syntax-highlighting/

---

## Including Code from Files

Use the `include` shortcode to render code from a file in the post's page bundle. The language is auto-detected from the file extension.

### Full file

```text
{{< include file="setup.py" >}}
```

### Specific line range

```text
{{< include file="setup.py" lines="11-27" >}}
```

### With line numbers

```text
{{< include file="setup.py" lines="11-27" linenos="table" >}}
```

Line numbers start at the correct original line number (11 in this example).

### With highlighted lines

Use `hl` to highlight lines by their **original file line numbers** — they're automatically adjusted when combined with `lines`:

```text
{{< include file="setup.py" lines="11-27" linenos="table" hl="19-20" >}}
```

Multiple values and ranges use space separation:

```text
{{< include file="setup.py" hl="3 11-16 19-20" >}}
```

### Include shortcode parameters

| Parameter | Example          | Description                                       |
|-----------|------------------|---------------------------------------------------|
| `file`    | `"setup.py"`     | Filename in the page bundle (required)            |
| `lang`    | `"python"`       | Language override (auto-detected from extension)   |
| `lines`   | `"5-12"`         | Line range to extract                              |
| `linenos` | `"table"`        | Show line numbers (`table` or `inline`)            |
| `hl`      | `"7 9-10"`       | Lines to highlight (original file line numbers)    |
