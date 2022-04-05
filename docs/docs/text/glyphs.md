---
id: glyphs
title: Glyphs
sidebar_label: Glyphs
slug: /text/glyphs
---

This component draws a run of glyphs, at corresponding positions, in a given font.

| Name        | Type       |  Description                                                           |
|:------------|:-----------|:-----------------------------------------------------------------------|
| glyphs      | `Glyph[]`  | Glyphs to draw                                                         |
| x?          | `number`.  | x coordinate of the origin of the entire run. Default is 0             |
| y?          | `number`.  | y coordinate of the origin of the entire run. Default is 0             |
| font        | `Font`     | Font to use (see [Fonts](/docs/text/fonts))                            |
| familyName? | `string`   | Font family name to use  (see [Fonts](/docs/text/fonts))               |
| size?       | `number`   | Font size if `familyName` is provided                                  |

## Draw text vertically

```tsx twoslash
import {Canvas, Glyphs, vec, useFont} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const font = useFont(require("./my-font.otf"), 16);
  if (font === null) {
    return null;
  }
  const glyphs = font
    .getGlyphIDs("Hello World!")
    .map((id, i) => ({ id, pos: vec(0, i*32) }));
  return (
    <Canvas style={{ flex:  1 }}>
      <Glyphs
        font={font}
        glyphs={glyphs}
      />
    </Canvas>
  );
}
```