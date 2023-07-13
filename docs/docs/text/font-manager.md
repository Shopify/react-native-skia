---
id: font-manager
title: Font Manager
sidebar_label: Font Manager
slug: /text/font-manager
---

In Skia, the `FontMgr` object manages a collection of font families.
It allows you to access fonts from the system and manage custom fonts.
This API will be the primary entry point for upcoming Text APIs.
You can create two kinds of font managers:

* System Font Manager via `Skia.FontMgr.System()`: Allows you to access system fonts. This font manager is a singleton and is only available on iOS and Android.
* Custom Font Manager via `Skia.FontMgr.Custom()`: Allows you to create a font manager from your font files.

We provide you with two helper functions:
* A `matchFont` function to resolve fonts using StyleSheet attributes from React Native.
* A `listFontFamilies` function to list the available system font families.
* A `useFonts` hook to load font files and create a custom font manager from it.

It should be noted that Skia handles fonts differently from React Native.
In React Native, a key maps to a font file.
However, in Skia, when providing a font file, the font manager analyzes the font metadata and uses it to match fonts accordingly.

## listFontFamilies

The `listFontFamilies` function returns the list of available system font families.
By default the function will list system fonts but you can pass an optional `fontMgr` object as parameter.

```jsx twoslash
import {listFontFamilies} from "@shopify/react-native-skia";

console.log(listFontFamilies());
```

Output example on Android:
```
["sans-serif", "arial", "helvetica", "tahoma", "verdana", ...]
```

or on iOS:
```
["Academy Engraved LET", "Al Nile", "American Typewriter", "Apple Color Emoji", ...]
```

## matchFont

The `matchFont` function matches a font based on attributes from the React Native `StyleSheet`. 

Here is its usage:

```jsx twoslash
import {Platform} from "react-native";
import {Canvas, Text, matchFont, Fill, Skia} from "@shopify/react-native-skia";
 
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
        y={fontStyle.fontSize}
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
- `fontStyle`: The slant of the font. Can be `normal`, `italic`, or `oblique`.
- `fontWeight`: The weight of the font. Can be `normal`, `bold`, or any of `100`, `200`, `300`, `400`, `500`, `600`, `700`, `800`, `900`.

By default, `matchFont` uses the system font manager to match the font style. However, if you want to use your custom font manager, you can pass it as the second parameter to the `matchFont` function:

```jsx
const customFontMgr = useFontMgr([
  require("../../Tests/assets/Roboto-Medium.ttf"),
  require("../../Tests/assets/Roboto-Bold.ttf"),
]);

const font = matchFont(fontStyle, customFontMgr);
```

## Custom Font Manager

We offer a `useFontMgr` hook to load a collection of font files and create a custom font manager from it.

```jsx twoslash
import {Platform} from "react-native";
import {Canvas, Text, matchFont, Fill, useFontMgr, Skia} from "@shopify/react-native-skia";
 

export const HelloWorld = () => {
  const customFontMgr = useFontMgr([
    require("../../Tests/assets/Roboto-Medium.ttf"),
    require("../../Tests/assets/Roboto-Bold.ttf"),
  ]);
  const fontFamily = "Roboto";
  const fontStyle = {
    fontFamily,
    fontWeight: "bold",
  };
  // Here we need to pass customFontMgr as parameter
  const font = matchFont(fontStyle, customFontMgr);
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="white" />
      <Text
        x={0}
        y={fontStyle.fontSize}
        text="Hello World"
        font={font}
      />
    </Canvas>
  );
};
```

## System Font Manager

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