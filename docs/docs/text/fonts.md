---
id: fonts
title: Fonts
sidebar_label: Fonts
slug: /text/fonts
---

## System Fonts

By default all the fonts available within your app are available in your Canvas.
For instance, you can write the following.

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

System fonts can also be accessed as a font instance using the system font manager.

```tsx twoslash
import {Canvas, Text, Skia} from "@shopify/react-native-skia";

const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica");
if (!typeface) {
  throw new Error("Helvetica not found");
}
const font = Skia.Font(typeface, 30);

export const HelloWorld = () => {
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

## Custom Fonts

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