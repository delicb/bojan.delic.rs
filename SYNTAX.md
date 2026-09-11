# Content Syntax Reference

Quick reference for syntax and features available when writing content (mostly blog posts).

---

## Cover Images

Blog posts can optionally have a cover image displayed as a full-width banner above the title. To
add one, place a file named `cover.*` in the post's page bundle directory:

```
content/blog/my-post/
├── index.md
└── cover.jpg       ← automatically picked up
```

Supported formats: `.jpg`, `.png`, `.svg`, `.webp`

The template finds the image via Hugo page resources (`cover.*` glob) — no front matter or markdown
needed. Posts without a cover image render normally.

Recommended dimensions: **1200×630px** (landscape). The image is displayed full-width and capped at
420px height with `object-fit: cover`.

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

Add `{linenos=table}` after the language to show line numbers. The `table` mode keeps numbers out of
copy-paste selections.

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

### Title / Filename Bar

Add a `title` attribute to display a filename or label above the code block:

````markdown
```yaml {title="docker-compose.yml"}
services:
  web:
    image: nginx
```
````

This renders a title bar above the code block showing the filename. The title replaces the language
label in the top-left corner.

Works with all other attributes:

````markdown
```go {title="main.go" linenos=table,hl_lines=[3]}
package main

func main() {}
```
````

> **Note**: The `include` shortcode automatically uses the filename as the title — no extra
> parameter needed.

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

| Attribute       | Values                             | Default | Description                             |
| --------------- | ---------------------------------- | ------- | --------------------------------------- |
| `title`         | string                             | —       | Filename or label shown above the block |
| `linenos`       | `table`, `inline`, `true`, `false` | `false` | Show line numbers. Prefer `table`.      |
| `hl_lines`      | `[1,"3-5",8]`                      | —       | Lines or ranges to highlight            |
| `linenostart`   | integer                            | `1`     | First line number                       |
| `anchorlinenos` | `true`, `false`                    | `true`  | Make line numbers clickable anchors     |

Hugo highlight docs: https://gohugo.io/content-management/syntax-highlighting/

---

## Including Code from Files

Use the `include` shortcode to render code from a file in the post's page bundle. The language is
auto-detected from the file extension.

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

Use `hl` to highlight lines by their **original file line numbers** — they're automatically adjusted
when combined with `lines`:

```text
{{< include file="setup.py" lines="11-27" linenos="table" hl="19-20" >}}
```

Multiple values and ranges use space separation:

```text
{{< include file="setup.py" hl="3 11-16 19-20" >}}
```

### Include shortcode parameters

| Parameter | Example      | Description                                      |
| --------- | ------------ | ------------------------------------------------ |
| `file`    | `"setup.py"` | Filename in the page bundle (required)           |
| `lang`    | `"python"`   | Language override (auto-detected from extension) |
| `lines`   | `"5-12"`     | Line range to extract                            |
| `linenos` | `"table"`    | Show line numbers (`table` or `inline`)          |
| `hl`      | `"7 9-10"`   | Lines to highlight (original file line numbers)  |

---

## Alerts (Admonitions)

GitHub-style alerts using the standard `> [!TYPE]` blockquote syntax. Five types are supported:

```markdown
> [!NOTE] Useful information that users should know, even when skimming content.

> [!TIP] Helpful advice for doing things better or more easily.

> [!IMPORTANT] Key information users need to know to achieve their goal.

> [!WARNING] Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION] Advises about risks or negative outcomes of certain actions.
```

Each type renders with a colour-coded left border and icon. Regular blockquotes (`>` without an
alert designator) are unaffected.

---

## Highlighted Text

Wrap text in double equals signs to highlight it (requires `mark` Goldmark extension):

```markdown
This is ==highlighted text== in a sentence.
```

Renders as a `<mark>` element with a coloured background that adapts to light/dark mode.

---

## Inserted Text

Wrap text in double plus signs to mark it as inserted (requires `insert` Goldmark extension):

```markdown
This is ++inserted text++ in a sentence.
```

Renders as an `<ins>` element with an accent-coloured underline.

---

## Subscript and Superscript

Use tildes for subscript and carets for superscript (requires `subscript` and `superscript` Goldmark
extensions):

```markdown
Water: H~2~O Equation: x^2^ + y^2^ = z^2^
```

---

## Keyboard Keys

Use raw `<kbd>` HTML tags to style keyboard shortcuts (requires `unsafe = true` in Goldmark config):

```markdown
Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.
```

Renders as a raised keycap (text font, deeper bottom edge) in both light and dark modes, so keys look
different from inline `code`.

### `kbd` shortcode

For shortcuts, prefer the shortcode. It splits the value on `+` and renders one keycap per key:

```text
{{< kbd "cmd+shift+d" >}}
```

Modifiers and special keys render as macOS symbols: `cmd` ⌘, `shift` ⇧, `alt`/`opt` ⌥, `ctrl` ⌃,
`enter` ↩, `tab` ⇥, `backspace` ⌫, `left`/`right`/`up`/`down` as arrows. Other single characters
render in upper case. The full key names show on hover (`title`).

---

## Collapsible Sections

Use raw `<details>` / `<summary>` HTML for collapsible content:

```markdown
<details>
<summary>Click to expand</summary>

Content here — supports **full Markdown**.

</details>
```

Renders with styled borders, background, and an accent-coloured disclosure triangle. The summary
gets a bottom border when the section is open.

---

## Heading Anchors

All headings (h2–h6) in blog posts automatically get a clickable `#` anchor link that appears on
hover. This enables deep-linking to specific sections.

No special syntax needed — it's automatic via the theme's heading render hook.

---

## External Links

Links to external domains automatically:

- Open in a new tab (`target="_blank"`)
- Display a small arrow icon after the link text

No special syntax needed — the theme's link render hook detects external URLs by comparing the link
hostname against the site's `baseURL`. Internal links (relative URLs, same-hostname absolute URLs,
`mailto:`, etc.) are unaffected.

---

### Rich content

Alerts support full Markdown inside — paragraphs, code blocks, lists, links, etc.:

````markdown
> [!TIP] To install Hugo on macOS, run:
>
> ```bash
> brew install hugo
> ```
>
> See the [Hugo docs](https://gohugo.io/installation/) for other platforms.
````

### Custom title

Override the default heading with the extended syntax (compatible with Obsidian):

```markdown
> [!WARNING] Do not run in production This script deletes all data in the database.
```

### Alert types

| Type        | Colour | Use for                                |
| ----------- | ------ | -------------------------------------- |
| `NOTE`      | Blue   | General supplementary information      |
| `TIP`       | Green  | Helpful advice, best practices         |
| `IMPORTANT` | Purple | Key info users must not miss           |
| `WARNING`   | Yellow | Potential issues, proceed with caution |
| `CAUTION`   | Red    | Dangerous actions, risk of data loss   |
