---
id: text
title: Text
sidebar_label: Text
slug: /text/text
---

The text component can be used to draw a simple text.
The font family and the font size must be specified.
The fonts available in the canvas are described in [here](/docs/text/fonts).

| Name       | Type      |  Description                                                  |
|:-----------|:----------|:--------------------------------------------------------------|
| value      | `string`  | Text to draw                                                  |
| familyName | `string`  | Font family name                                              |
| size       | `number`  | Font size                                                     |

### Example

```tsx twoslash
import {Canvas, Text} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={0}
        y={0}
        value="Hello World"
        familyName="serif"
        size={32}
      />
    </Canvas>
  );
};
```