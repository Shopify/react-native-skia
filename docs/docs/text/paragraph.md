---
id: paragraph
title: Paragraph
sidebar_label: Paragraph
slug: /text/paragraph
---

React Native Skia offers an API to perform text layouts.
Behind the scene, this API is the Skia Paragraph API.

## Hello World

In the example below, we create a simple paragraph based on custom fonts.
The emojis will be renderer using the emoji font available on the platform.
Other system fonts will are available as well.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const customFontMgr = useFonts({
    Roboto: [
      require("path/to/Roboto-Regular.ttf"),
      require("path/to/Roboto-Medium.ttf")
    ]
  });

  const paragraph = useMemo(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const textStyle = {
      color: Skia.Color("black"),
      fontFamilies: ["Roboto"],
      fontSize: 50,
    };
    return Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(textStyle)
      .addText("Say Hello to ")
      .pushStyle({ ...textStyle, fontStyle: { weight: 500 } })
      .addText("Skia 🎨")
      .pop()
      .build();
  }, [customFontMgr]);

  // Render the paragraph
  return <Paragraph paragraph={paragraph} x={0} y={0} width={300} />;
};
```

Below is the result on Android (left) and iOS (right).
<img src={require("/static/img/paragraph/hello-world-android.png").default} width="256" height="256" />
<img src={require("/static/img/paragraph/hello-world-ios.png").default} width="256" height="256" />

On Web, you will need to provide you own emoji font ([NotoColorEmoji](https://fonts.google.com/noto/specimen/Noto+Color+Emoji) for instance) and add it to the list of font families.

```tsx twoslash
import { useFonts, Skia } from "@shopify/react-native-skia";

const customFontMgr = useFonts({
  Roboto: [
    require("path/to/Roboto-Regular.ttf"),
    require("path/to/Roboto-Medium.ttf")
  ],
  // Only load the emoji font on Web
  Noto: [
    require("path/to/NotoColorEmoji.ttf")
  ]
});

// We add Noto to the list of font families
const textStyle = {
  color: Skia.Color("black"),
  fontFamilies: ["Roboto", "Noto"],
  fontSize: 50,
};
```

## Paragraph Height

To get the paragraph height, you can calculate the layout using `layout()` and once done, you can invoke `getHeight()`.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make()
      .addText("Say Hello to ")
      .addText("Skia 🎨")
      .pop()
      .build();
    // Calculate the layout
    para.layout(300);
    return para;
  }, []);
  // Now the paragraph height is available
  const height = paragraph.getHeight();
  // Render the paragraph
  return <Paragraph paragraph={paragraph} x={0} y={0} width={300} />;
};
```

## Fonts

By default, the paragraph API will use the system fonts.
You can also use custom fonts with this API was well. 

The `useFonts` hooks allows you to load custom fonts to be used for your Skia drawing.
The font files should be organized by family names.
For example:

```tsx twoslash
import {useFonts} from "@shopify/react-native-skia";

const fontMgr = useFonts({
  Roboto: [
    require("./Roboto-Medium.ttf"),
    require("./Roboto-Regular.ttf"),
    require("./Roboto-Bold.ttf"),
  ],
  Helvetica: [require("./Helvetica.ttf")],
});
if (!fontMgr) {
  // Returns null until all fonts are loaded
}
// Now the fonts are available
```

You can also list the available system fonts via `listFontFamilies()` function.

## Styling Paragraphs

These properties define the overall layout and behavior of a paragraph.

| Property                | Description                                                                           |
|-------------------------|---------------------------------------------------------------------------------------|
| `disableHinting`        | Controls whether text hinting is disabled.                                            |
| `ellipsis`              | Specifies the text to use for ellipsis when text overflows.                           |
| `heightMultiplier`      | Sets the line height as a multiplier of the font size.                                |
| `maxLines`              | Maximum number of lines for the paragraph.                                            |
| `replaceTabCharacters`  | Determines whether tab characters should be replaced with spaces.                     |
| `strutStyle`            | Defines the strut style, which affects the minimum height of a line.                  |
| `textAlign`             | Sets the alignment of text (left, right, center, justify, start, end).                |
| `textDirection`         | Determines the text direction (RTL or LTR).                                           |
| `textHeightBehavior`    | Controls the behavior of text ascent and descent in the first and last lines.         |
| `textStyle`             | Default text style for the paragraph (can be overridden by individual text styles).   |

## Text Style Properties

These properties are used to style specific segments of text within a paragraph.

| Property              | Description                                                                         |
|-----------------------|-------------------------------------------------------------------------------------|
| `backgroundColor`     | Background color of the text.                                                       |
| `color`               | Color of the text.                                                                  |
| `decoration`          | Type of text decoration (underline, overline, line-through).                        |
| `decorationColor`     | Color of the text decoration.                                                       |
| `decorationThickness` | Thickness of the text decoration.                                                   |
| `decorationStyle`     | Style of the text decoration (solid, double, dotted, dashed, wavy).                 |
| `fontFamilies`        | List of font families for the text.                                                 |
| `fontFeatures`        | List of font features.                                                              |
| `fontSize`            | Font size of the text.                                                              |
| `fontStyle`           | Font style (weight, width, slant).                                                  |
| `fontVariations`      | Font variations.                                                                    |
| `foregroundColor`     | Foreground color (for effects like gradients).                                      |
| `heightMultiplier`    | Multiplier for line height.                                                         |
| `halfLeading`         | Controls half-leading value.                                                        |
| `letterSpacing`       | Space between characters.                                                           |
| `locale`              | Locale for the text (affects things like sorting).                                  |
| `shadows`             | List of text shadows.                                                               |
| `textBaseline`        | Baseline for the text (alphabetic, ideographic).                                    |
| `wordSpacing`         | Space between words.                                                                |

These tables offer a quick reference to differentiate between paragraph and text styles in React Native Skia. You can use them to guide developers on how to apply various styles to create visually appealing and functional text layouts.
Below is an example using different font styling:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, FontStyle } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const customFontMgr = useFonts({
    Roboto: [
        require("path/to/Roboto-Italic.ttf"),
        require("path/to/Roboto-Regular.ttf"),
        require("path/to/Roboto-Bold.ttf")
    ],
  });

  const paragraph = useMemo(() => {
    // Are the custom fonts loaded?
    if (!customFontMgr) {
      return null;
    }
    const textStyle = {
      fontSize: 24,
      fontFamilies: ["Roboto"],
      color: Skia.Color("#000"),
    };

    const paragraphBuilder = Skia.ParagraphBuilder.Make({}, customFontMgr);
    paragraphBuilder
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Bold })
      .addText("This text is bold\n")
      .pop()
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Normal })
      .addText("This text is regular\n")
      .pop()
      .pushStyle({ ...textStyle, fontStyle: FontStyle.Italic })
      .addText("This text is italic")
      .pop()
      .build();
    return paragraphBuilder.build();
  }, [customFontMgr]);

  return <Paragraph paragraph={paragraph} x={0} y={0} width={300} />;
};
```

#### Result

<img src={require("/static/img/paragraph/font-style-node.png").default} width="256" height="256" />
