---
id: text
title: Text
sidebar_label: Text
slug: /text/text
---

The text component can be used to draw a simple text.
The fonts available in the canvas are described in [here](/docs/text/fonts).

| Name        | Type      |  Description                                                  |
|:------------|:----------|:--------------------------------------------------------------|
| text        | `string`  | Text to draw                                                  |
| font        | `Font`     | Font to use (see [Fonts](/docs/text/fonts))                  |
| familyName? | `string`   | Font family name to use  (see [Fonts](/docs/text/fonts))     |
| size?       | `number`   | Font size if `familName` is provided                         |

### Example

```tsx twoslash
import {Canvas, Text} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={0}
        y={0}
        text="Hello World"
        familyName="serif"
        size={32}
      />
    </Canvas>
  );
};
```

