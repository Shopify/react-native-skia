---
id: text
title: Text
sidebar_label: Text
slug: /text/text
---

The text component can be used to draw a simple text.
The fonts available in the canvas are described in [here](/docs/text/fonts).

| Name        | Type       |  Description                                                  |
|:------------|:-----------|:--------------------------------------------------------------|
| text        | `string`   | Text to draw                                                  |
| font        | `Font`     | Font to use (see [Fonts](/docs/text/fonts))                   |

### Example

```tsx twoslash
import {Canvas, Text, useFont} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const font = useFont(require("./my-font.ttf"), 16);
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={0}
        y={0}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

