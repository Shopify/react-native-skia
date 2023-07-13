---
id: font-manager
title: Font Manager
sidebar_label: Font Manager
slug: /text/font-manager
---

In Skia, the `FontMgr` object manages a collection of font families.
It allows you to access fonts from the system and manage custom fonts.

## Custom Fonts

The `useFonts` hooks allows you to load custom fonts to be used for your Skia drawing.
The font files should be organized by family names.
For instance:

```tsx twoslash
import {useFonts} from "@shopify/react-native-skia";

const fontMgr = useFonts({
  Roboto: [
    require("./Roboto-Medium.ttf"),
    require("./Roboto-Regular.ttf"),
    require("./Roboto-Bold.ttf"),
  ],
  UberMove: [require("./UberMove-Medium_mono.ttf")],
});
// Returns null until all fonts are loaded
if (!fontMgr) {
  return null;
}
// Now the fonts are available
```

Once the fonts are loaded, we provide a `matchFont` function that given a font style will return a font object that you can use directly.

```tsx twoslash
import {useFonts, Text, matchFont} from "@shopify/react-native-skia";

const Demo = () => {
  const fontMgr = useFonts({
    Roboto: [
      require("./Roboto-Medium.ttf"),
      require("./Roboto-Regular.ttf"),
      require("./Roboto-Bold.ttf"),
    ],
    UberMove: [require("./UberMove-Medium_mono.ttf")],
  });
  if (!fontMgr) {
    return null;
  }
  const fontStyle = {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontSize: 16
  };
  const font = matchFont(fontStyle, fontMgr);
  return (
    <Text text="Hello World" y={32} x={32} font={font} />
  );
};
```

## System Fonts

System fonts are available via `Skia.FontMgr.System()`.
You can list system fonts via  `listFontFamilies` function returns the list of available system font families.
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

By default matchFont, will match fonts from the system font manager:

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
const fontMgr = useFonts([
  require("../../Tests/assets/Roboto-Medium.ttf"),
  require("../../Tests/assets/Roboto-Bold.ttf"),
]);

const font = matchFont(fontStyle, fontMgr);
```

## Low-level API

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