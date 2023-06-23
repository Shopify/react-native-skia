---
id: font-manager
title: Font Manager
sidebar_label: Font Manager
slug: /text/font-manager
---

:::info

FontMgr is not yet available on Web.

:::

In Skia, the `FontMgr` object manages a collection of font families.
Currently you can use it to easily access fonts from the system and manager custom fonts.
This API will be the main entry point for upcoming Text APIs.
You can create two kinds of font managers:

* System Font Manager via `Skia.FontMgr.System()`: Allows you to access system fonts. This font manager is a singleton and is only available on iOS and Android.
* Custom Font Manager via `Skia.FontMgr.MakeFromData()`: Allows to create a font manager from your own.

Skia handles fonts differently from React Native.
In React Native, a key maps to a font file.
However, in Skia, when providing a font file, it analyzes the font metadata and uses it to match fonts accordingly.
We provide a `matchFont` helper to resolve fonts using Stylesheet attributes from React Native.

## matchFont

The `matchFont` function matches a font based on attributes from the React Native `StyleSheet`. 

Here is its usage:

```jsx twoslash
import {Platform} from "react-native";
import {Canvas, Text, useFont, Fill, Skia, FontStyle} from "@shopify/react-native-skia";
 
const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};
const font = matchFont(fontStyle);

export const HelloWorld = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Text
        x={0}
        y={fontSize}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

The `fontStyle` object can have the following list of optional attributes:

- `fontFamily`: The name of the font family.
- `fontSize`: The size of the font.
- `fontStyle`: The slant of the font. Can be "normal", "italic", or "oblique".
- `fontWeight`: The weight of the font. Can be "normal", "bold", or any of "100", "200", "300", "400", "500", "600", "700", "800", "900".

By default, `matchFont` uses the system font manager to match the font style. However, if you want to use your custom font manager, you can pass it as the second parameter to the `matchFont` function:

```jsx
const customFontMgr = useFontMgr([
  require("../../Tests/assets/Roboto-Medium.ttf"),
  require("../../Tests/assets/Roboto-Bold.ttf"),
]);

const font = matchFont(fontStyle, customFontMgr);
```

## Custom FontMgr

We offer a `useFonts` hook to load a collection of font files and create a custom font manager from it.

```jsx twoslash
import {Platform} from "react-native";
import {Canvas, Text, useFont, Fill, Skia, FontStyle} from "@shopify/react-native-skia";
 
const fontFamily = "Roboto";
const fontStyle = {
  fontFamily,
  fontWeight: "bold",
};
const font = matchFont(fontStyle);

export const HelloWorld = () => {
  const customFontMgr = useFontMgr([
    require("../../Tests/assets/Roboto-Medium.ttf"),
    require("../../Tests/assets/Roboto-Bold.ttf"),
  ]);

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Text
        x={0}
        y={fontSize}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

## System FontMgr

The basic usage of the system font manager is as follows.
These are the APIs used behind the scene by the `matchFont` function.

```tsx twoslash
import {Platform} from "react-native";
import {Skia, FontStyle} from "@shopify/react-native-skia";
 
const familyName = Platform.select({ ios: "Helvetica", default: "serif" });
const fontSize = 32;
// Get the system font manager
const fontMgr = Skia.FontMgr.System();
const typeface =  fontMgr.matchFamilyStyle(familyName, FontStyle.Bold);
const font = Skia.Font(typeface, fontSize);
```
