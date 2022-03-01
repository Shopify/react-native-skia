---
id: path
title: Text Path
sidebar_label: Text Path
slug: /text/path
---

Draws text along an SVG path.
The fonts available in the canvas are described in [here](/docs/text/fonts).

| Name        | Type               |  Description                                                 |
|:------------|:-------------------|:-------------------------------------------------------------|
| path        | `Path` or `string` | Path to draw. Can be a string using the [SVG Path notation](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands) or an object created with `Skia.Path.Make()` |
| text        | `string`           | Text to draw                                                 |
| font        | `Font`             | Font to use (see [Fonts](/docs/text/fonts))                  |
| familyName? | `string`           | Font family name to use  (see [Fonts](/docs/text/fonts))     |
| size?       | `number`           | Font size if `familName` is provided                         |

## Example

```tsx twoslash
import {Canvas, Group, TextPath, Skia} from "@shopify/react-native-skia";

const circle = Skia.Path.Make();
circle.addCircle(128, 128, 128);

export const HelloWorld = () => {
  return (
      <Canvas style={{ flex: 1 }}>
        <Group transform={[{ translateY: 25 }]}>
          <TextPath
            path={circle}
            familyName="helvetica"
            size={24}
            text="Hello World!"
          />
        </Group>
      </Canvas>
  );
};
```
