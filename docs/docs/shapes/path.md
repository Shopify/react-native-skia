---
id: path
title: Path
sidebar_label: Path
slug: /shapes/path
---

In Skia, paths are semantically identical to [SVG Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths).

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| path      | `IPath` or `string` | Path to draw. Can be a string using the [SVG Path notation](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands) or an object created with `Skia.Path.Make()`. |
| start     | `number` | Trims the start of the path. Value is in the range `[0, 1]` (default is 0). |
| end       | `number` | Trims the end of the path. Value is in the range `[0, 1]` (default is 1). |

### Using SVG Notation

### Using Path Object

### Trim