---
title: "Herdr Shortcuts in Ghostty"
date: 2026-09-11
description:
  "How I get Cmd shortcuts to herdr inside Ghostty, with a Ghostty key table and a fish wrapper that
  turns the table on and off."
tags: ["herdr", "ghostty", "kitty", "terminal", "fish", "macos"]
coverAlt: "Cmd+D keycaps send an escape sequence to a Ghostty window that runs herdr panes."
draft: false
---

[`herdr`](https://herdr.dev/) is a terminal workspace manager for AI coding agents. It has
workspaces, tabs and panes, like tmux. It also shows which agent is busy, which one waits for input
and which one is done. I run it inside [Ghostty](https://ghostty.org/) on macOS.

Like tmux, `herdr` has a prefix key. Mine is {{< kbd "ctrl+a" >}}. It works, but for actions that I
use all the time, two key presses are too many.

Muscle memory is the bigger reason. I have used the Ghostty shortcuts for splits and tabs for a long
time: {{< kbd "cmd+d" >}} for a new pane, {{< kbd "cmd+t" >}} for a new tab, and so on. Other
terminals and many other applications use the same or similar keys. I press them without thinking. I
wanted the same keys in `herdr`, not a second set of keys to learn.

## Ghostty gets the keys first

The terminal sees each key before the program inside it. Ghostty has default macOS bindings for
almost all the keys I wanted:

| Shortcut                                   | Ghostty default                |
| ------------------------------------------ | ------------------------------ |
| {{< kbd "cmd+d" >}}                        | `new_split:right`              |
| {{< kbd "cmd+shift+d" >}}                  | `new_split:down`               |
| {{< kbd "cmd+[" >}} / {{< kbd "cmd+]" >}}  | `goto_split:previous` / `next` |
| {{< kbd "cmd+alt" >}} + arrows             | `goto_split`                   |
| {{< kbd "cmd+ctrl" >}} + arrows            | `resize_split`                 |
| {{< kbd "cmd+shift+enter" >}}              | `toggle_split_zoom`            |
| {{< kbd "cmd+w" >}}                        | `close_surface`                |
| {{< kbd "cmd+t" >}}                        | `new_tab`                      |
| {{< kbd "cmd+1" >}} to {{< kbd "cmd+8" >}} | `goto_tab`                     |
| {{< kbd "cmd+n" >}}                        | `new_window`                   |
| {{< kbd "cmd+shift+w" >}}                  | `close_window`                 |

When I press {{< kbd "cmd+d" >}} in `herdr`, Ghostty makes a native split next to it. `herdr` never
sees the key.

## The herdr side

This part is easy. Each `herdr` action gets two bindings, one with the prefix and one with
{{< kbd "cmd" >}}:

```toml {title="~/.config/herdr/config.toml"}
[keys]
prefix = "ctrl+a"

split_vertical = ["prefix+v", "cmd+d"]
split_horizontal = ["prefix+minus", "cmd+shift+d"]
focus_pane_left = ["prefix+h", "cmd+alt+left"]
focus_pane_down = ["prefix+j", "cmd+alt+down"]
focus_pane_up = ["prefix+k", "cmd+alt+up"]
focus_pane_right = ["prefix+l", "cmd+alt+right"]
cycle_pane_previous = ["prefix+shift+tab", "cmd+["]
cycle_pane_next = ["prefix+tab", "cmd+]"]
resize_pane_left = "cmd+ctrl+left"
resize_pane_down = "cmd+ctrl+down"
resize_pane_up = "cmd+ctrl+up"
resize_pane_right = "cmd+ctrl+right"
zoom = ["prefix+z", "cmd+shift+enter"]
close_pane = ["prefix+x", "cmd+w"]

new_tab = ["prefix+c", "cmd+t"]
previous_tab = ["prefix+p", "cmd+shift+["]
next_tab = ["prefix+n", "cmd+shift+]"]
switch_tab = ["prefix+1..9", "cmd+1..9"]
close_tab = ["prefix+shift+x", "cmd+alt+w"]

new_workspace = ["prefix+shift+n", "cmd+n"]
previous_workspace = "cmd+shift+left"
next_workspace = "cmd+shift+right"
switch_workspace = "cmd+ctrl+1..9"
close_workspace = ["prefix+shift+d", "cmd+shift+w"]
```

The prefix bindings work in any terminal. The {{< kbd "cmd" >}} bindings work only when the terminal
lets the key through to `herdr`. The rest of this post is about that part.

## Kitty can match on the window title

My old `kitty` config has the same {{< kbd "cmd" >}} shortcuts for `kitty` splits. So `kitty` has
the same problem. But `kitty` also has a clean fix for it.

`kitty` supports
[conditional mappings](https://sw.kovidgoyal.net/kitty/mapping/#conditional-mappings-depending-on-the-state-of-the-focused-window).
The `--when-focus-on` option checks the focused window, and one of the fields it can check is the
window title. `herdr` sets the title, and my config makes that title start with `herdr`:

```toml {title="~/.config/herdr/config.toml"}
window_title = "herdr {workspace}: {tab}"
```

With that title, a few lines in `kitty` would do the job:

```conf {title="kitty.conf"}
map --when-focus-on title:^herdr cmd+d
map --when-focus-on title:^herdr cmd+shift+d
map --when-focus-on title:^herdr cmd+t
map --when-focus-on title:^herdr cmd+w
```

A conditional mapping with no action removes the `kitty` shortcut while the condition is true.
`kitty` then sends the key to the program, and `herdr` gets it. When `herdr` exits, the shell sets a
different title, and {{< kbd "cmd+d" >}} makes a `kitty` split again. There is no mode to remember.

## Ghostty has key tables instead

Ghostty cannot make a keybind depend on the window title or on the program that runs. What it has,
since version 1.3, is key tables.

A key table is a named set of bindings. You turn it on with the `activate_key_table` action and off
with `deactivate_key_table`. While a table is active, Ghostty looks for the key in that table first.
If the key is not there, Ghostty uses the default bindings. So {{< kbd "cmd+c" >}} and
{{< kbd "cmd+v" >}} still work while `herdr` runs.

This is the start of my `herdr` table. The full table has the same pattern for all tab and workspace
keys from the `herdr` config:

```ini {title="~/.config/ghostty/config"}
# Toggle Herdr mode.
keybind = cmd+shift+h=activate_key_table:herdr
keybind = herdr/
keybind = herdr/cmd+shift+h=deactivate_key_table

# Panes.
keybind = herdr/performable:cmd+d=csi:100;9u
keybind = herdr/performable:cmd+shift+d=csi:100;10u
keybind = herdr/performable:cmd+[=csi:91;9u
keybind = herdr/performable:cmd+]=csi:93;9u
keybind = herdr/performable:cmd+alt+left=csi:1;11D
keybind = herdr/performable:cmd+alt+down=csi:1;11B
keybind = herdr/performable:cmd+alt+up=csi:1;11A
keybind = herdr/performable:cmd+alt+right=csi:1;11C
keybind = herdr/performable:cmd+shift+enter=csi:13;10u
keybind = herdr/performable:cmd+w=csi:119;9u

# Tabs.
keybind = herdr/performable:cmd+t=csi:116;9u
keybind = herdr/performable:cmd+digit_1=csi:49;9u
# ... and so on for the other tab and workspace keys.
```

The line `keybind = herdr/`, with nothing after the slash, defines the table and clears it.
{{< kbd "cmd+shift+h" >}} turns the table on from the default bindings. Inside the table, the same
key turns it off. The `performable:` prefix tells Ghostty to consume the key only when the action
can run.

### What the CSI sequences mean

Inside the table, Ghostty does not run its own action for the key. It sends the escape sequence that
`herdr` expects for that key. The format comes from the
[`kitty` keyboard protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/):

```text
ESC [ <key code> ; <modifiers> u
```

Ghostty adds the `ESC [` part, so the config has only the rest. The key code is the Unicode value of
the key: `100` is `d`, `116` is `t`, `91` is `[`. The modifier value is 1 plus the sum of the
modifier bits. Shift is 1, Alt is 2, Ctrl is 4 and Super, which is {{< kbd "cmd" >}} on a Mac, is 8.
My config uses four values:

| Value | Modifiers               |
| ----- | ----------------------- |
| `9`   | {{< kbd "cmd" >}}       |
| `10`  | {{< kbd "cmd+shift" >}} |
| `11`  | {{< kbd "cmd+alt" >}}   |
| `13`  | {{< kbd "cmd+ctrl" >}}  |

So `csi:100;9u` is {{< kbd "cmd+d" >}}, and `csi:119;11u` is {{< kbd "cmd+alt+w" >}}. Arrow keys use
an older form, `ESC [ 1 ; <modifiers> <letter>`, where `A`, `B`, `C` and `D` are up, down, right and
left. `csi:1;11D` is {{< kbd "cmd+alt+left" >}}.

### The resize keys

{{< kbd "cmd+ctrl" >}} + arrows are in both places:

```ini {title="~/.config/ghostty/config"}
# Keep Ghostty resize shortcuts outside Herdr mode.
keybind = cmd+ctrl+left=resize_split:left,20
keybind = cmd+ctrl+right=resize_split:right,20
keybind = cmd+ctrl+up=resize_split:up,20
keybind = cmd+ctrl+down=resize_split:down,20

keybind = herdr/performable:cmd+ctrl+left=csi:1;13D
keybind = herdr/performable:cmd+ctrl+down=csi:1;13B
keybind = herdr/performable:cmd+ctrl+up=csi:1;13A
keybind = herdr/performable:cmd+ctrl+right=csi:1;13C
```

Without the table, the keys resize Ghostty splits. With the table, they go to `herdr` and resize
`herdr` panes. The keys stay the same, and they act on the layout that I look at.

## A wrapper turns the table on and off

The manual toggle is easy to forget. If I forget to turn it on, {{< kbd "cmd+d" >}} makes a Ghostty
split next to `herdr`. If I forget to turn it off after `herdr` exits, Ghostty keeps sending CSI
sequences to the shell instead of making splits.

Ghostty 1.3 also added [AppleScript support](https://ghostty.org/docs/features/applescript). A
script can find the focused terminal and run any keybind action on it with `perform action`. That is
all I need, so a fish function wraps the `herdr` command:

```fish {title="~/.config/fish/functions/herdr.fish"}
function herdr --description 'Run Herdr with Ghostty key mode'
    set -l ghostty_terminal_id

    if test "$TERM_PROGRAM" = ghostty; and command -q osascript; and not set -q HERDR_ENV
        set ghostty_terminal_id (osascript \
            -e 'tell application "Ghostty"' \
            -e 'set target_terminal to focused terminal of selected tab of front window' \
            -e 'perform action "activate_key_table:herdr" on target_terminal' \
            -e 'return id of target_terminal' \
            -e 'end tell')

        if test $status -ne 0
            return 1
        end
    end

    command herdr $argv
    set -l herdr_status $status

    if test -n "$ghostty_terminal_id"
        osascript \
            -e 'on run argv' \
            -e 'set target_id to item 1 of argv' \
            -e 'tell application "Ghostty"' \
            -e 'set matches to every terminal whose id is target_id' \
            -e 'if (count of matches) > 0 then' \
            -e 'perform action "deactivate_key_table" on item 1 of matches' \
            -e 'end if' \
            -e 'end tell' \
            -e 'end run' \
            "$ghostty_terminal_id" >/dev/null
    end

    return $herdr_status
end
```

Step by step:

1. The function touches the key table only in Ghostty, only when `osascript` is available, and only
   outside `herdr`. `herdr` sets `HERDR_ENV=1` in its panes, so a `herdr` call from a `herdr` pane
   does not change the table.
2. The first script turns on the `herdr` table for the focused terminal and returns the ID of that
   terminal. If the script fails, the function stops and `herdr` does not start.
3. `command herdr` runs the real `herdr` binary, not the function again.
4. When `herdr` exits or I detach, the second script turns the table off. It finds the terminal by
   the saved ID, not by focus. While `herdr` runs, I can move to a different tab or window, and then
   the focused terminal is a different one. The script also checks that the terminal still exists.
5. The function returns the exit status of `herdr`, so scripts that call `herdr` still see failures.

{{< kbd "cmd+shift+h" >}} stays in the config for cases that the wrapper does not cover. For
example, if I connect to a server with plain ssh and start `herdr` there, the wrapper on my Mac does
not run.

## Kitty or Ghostty

The `kitty` version needs one line for each shortcut, and the title match does all the work. The
Ghostty version needs a key table that translates the keys and a wrapper that decides when the table
is active. It is more setup, but I keep the {{< kbd "cmd" >}} shortcuts. If Ghostty adds conditional
keybinds one day, the wrapper and the manual toggle can go.
