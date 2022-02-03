---
id: fonts
title: Fonts
sidebar_label: Fonts
slug: /text/fonts
---

By default all the fonts available within your app are available in your Canvas. For instance, you can write the following.

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
        size={16}
      />
    </Canvas>
  );
};
```

Alternatively, you can use your own set of custom fonts to be available in the canvas, as seen below.

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