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
| text       | `string`  | Text to draw                                                   |
| size?       | `number`  | Font size                                                     |
| familyName? | `string`  | Font family name                                              |
| font?       | `font`    | Custom font to use                                            |

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

