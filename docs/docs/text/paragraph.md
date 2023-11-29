---
id: paragraph
title: Paragraph
sidebar_label: Paragraph
slug: /text/paragraph
---

React Native Skia offers an API to perform text layouts.
Behind the scene, this API is the Skia Paragraph API.

The first step to create a paragraph, is to specify the set of fonts you would like to use.
You can use custom fonts or system fonts, [see Fonts management](/docs/text/fonts).

## Hello World

In the example below, we create a simple paragraph based on  custom fonts.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const customFontMgr = useFonts({
    Roboto: [
      require("path/to/Roboto-Regular.ttf"),
      require("path/to/Roboto-Medium.ttf")
    ],
    Noto: [
      require("path/to/Noto.ttf")
    ]
  });

  const paragraph = useMemo(() => {
    // Are the font loaded already?
    if (!customFontMgr) {
      return null;
    }
    const textStyle = {
      color: Skia.Color("black"),
      fontFamilies: ["Roboto", "Noto"],
      fontSize: 50,
    };
    return Skia.ParagraphBuilder.MakeFromFontProvider(customFontMgr)
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

### Result

<img src={require("/static/img/paragraph/hello-world-node.png").default} width="256" height="256" />

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

### Text Style Properties

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

    const paragraphBuilder = Skia.ParagraphBuilder.MakeFromFontProvider(customFontMgr);
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

## Using System Fonts

You can also draw a paragraph using system fonts.
Simply use `Skia.ParagraphBuilder.MakeFromSystem` instead of `Skia.ParagraphBuilder.MakeFromFontProvider`.
The list of available system fonts can be access via `listFontFamilies()`.

```tsx twoslash
import { useMemo } from "react";
import { Canvas, Paragraph, Skia } from "@shopify/react-native-skia";
import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "Chalkduster",
  android: "casual",
  default: "serif",
});

export const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const paragraphBuilder = Skia.ParagraphBuilder.MakeFromSystem();
    const textStyle = {
      fontSize: 20,
      fontFamilies: [fontFamily],
      color: Skia.Color("#000"),
    };

    // Add text to the paragraph
    paragraphBuilder.pushStyle(textStyle).addText("Hello, world! ☺️");

    return paragraphBuilder.build();
  }, []);

  // Render the paragraph
  return (
    <Canvas style={{ flex: 1 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={300} />
    </Canvas>
  );
};
```

