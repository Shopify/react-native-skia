---
id: glyphs
title: Glyphs
sidebar_label: Glyphs
slug: /text/glyphs
---

This component raws a run of glyphs, at corresponding positions, in a given font.
The font family and the font size must be specified.
The fonts available in the canvas are described in [here](/docs/text/fonts).

| Name        | Type       |  Description                                                           |
|:------------|:-----------|:-----------------------------------------------------------------------|
| glyphs      | `Ghlyph[]` | Glyphs to draw                                                         |
| x?          | `number`.  | x coordinate of the origin of the entire run. Default is 0             |
| y?          | `number`.  | y coordinate of the origin of the entire run. Default is 0             |
| size?       | `number`   | Font size                                                              |
| familyName? | `string`   | Font family name                                                       |
| font?       | `font`     | Custom font to use                                                     |


## Draw text vertically

```tsx twoslash
import {Canvas, Glyphs, vec} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const glyphs = "Hello World!"
    .split("")
    .map((c, i) => ({ id: c.codePointAt(0)!, pos: vec(0, i * 32) }));
  return (
    <Canvas style={{ flex:  1 }}>
      <Glyphs
        familyName="serif"
        size={32}
        glyphs={glyphs}
      />
    </Canvas>
  );
}
```