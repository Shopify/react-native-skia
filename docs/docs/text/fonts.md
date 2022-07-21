---
id: fonts
title: Fonts
sidebar_label: Fonts
slug: /text/fonts
---

You can use your own set of custom fonts to be available in the canvas, as seen below.

Note: The if clause has to be stated in the top level, above the canvas, not in child components. 

```tsx twoslash
import {Canvas, Text, useFont} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const font = useFont(require("./my-custom-font.otf"), 16);
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Text
        x={0}
        y={0}
        font={font}
        text="Hello World"
      />
    </Canvas>
  );
};
```
