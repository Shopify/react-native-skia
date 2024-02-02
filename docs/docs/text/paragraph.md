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

## Using Paints

You can use paint objects for the foreground and the background of a text style.

<img src={require("/static/img/paragraph/background-node.png").default} width="256" height="256" />

Below we use a foreground and a background paint on a text style:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, Canvas, Rect, TileMode } from "@shopify/react-native-skia";

// Our background shader
const source = Skia.RuntimeEffect.Make(`
uniform vec4 position;
uniform vec4 colors[4];

vec4 main(vec2 pos) {
  vec2 uv = (pos - vec2(position.x, position.y))/vec2(position.z, position.w);
  vec4 colorA = mix(colors[0], colors[1], uv.x);
  vec4 colorB = mix(colors[2], colors[3], uv.x);
  return mix(colorA, colorB, uv.y);
}`)!;

// Define an array of colors for the gradient to be used in shader uniform
const colors = ["#dafb61", "#61DAFB", "#fb61da", "#61fbcf"].flatMap(
  (c) => Array.from(Skia.Color(c))
);

const MyParagraph = () => {
  const paragraph = useMemo(() => {

    // Create a foreground paint.
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setShader(
      source.makeShader([0, 0, 256, 256, ...colors])
    );

    // Create a foreground paint. We use a radial gradient.
    const foregroundPaint = Skia.Paint();
    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: 0, y: 0 },
        256,
        [Skia.Color("magenta"), Skia.Color("yellow")],
        null,
        TileMode.Clamp
      )
    );

    const para = Skia.ParagraphBuilder.Make()
     .pushStyle(
        {
          fontFamilies: ["Roboto"],
          fontSize: 72,
          fontStyle: { weight: 500 },
          color: Skia.Color("black"),
        },
        foregroundPaint,
        backgroundPaint
      )
      .addText("Say Hello to React Native Skia")
      .pop()
      .build();
    return para;
  }, []);
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={256} />
    </Canvas>
  );
};
```

### Applying Effects

The `Paragraph` component doesn't follow the same painting rules as other components.
However you can apply effets using the `layer` property.
For instance, in the example below, fopr  we apply a blur image filter.

```tsx twoslash
import React from "react";
import { Canvas, ImageSVG, Skia, Group, Paint, Blur, Paragraph } from "@shopify/react-native-skia";

const width = 256;
const height = 256;

export const Demo = () => {
  const paragraph = Skia.ParagraphBuilder.Make()
          .pushStyle({
            color: Skia.Color("black"),
            fontSize: 25,
          })
          .addText("Hello Skia")
          .build();
  return (
    <Canvas style={{ flex: 1 }}>
      <Group layer={<Paint><Blur blur={10} /></Paint>}>
        <Paragraph paragraph={paragraph} x={0} y={0} width={width} />
      </Group>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/blurred-paragraph-node.png").default} width="256" height="256" />


## Paragraph Bounding Box

Before getting the paragraph height and width, you need to compute its layout using `layout()` and and once done, you can invoke `getHeight()` for the height and `getLongestLine()` for the width.

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, useFonts, Canvas, Rect } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make()
      .addText("Say Hello to React Native Skia")
      .build();
    // Calculate the layout
    para.layout(200);
    return para;
  }, []);
  // Now the paragraph height is available
  const height = paragraph.getHeight();
  const width = paragraph.getLongestLine();
  // Render the paragraph
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      {/* Maximum paragraph width */}
      <Rect x={0} y={0} width={200} height={256} color="magenta" />
      {/* Paragraph bounding box */}
      <Rect x={0} y={0} width={width} height={height} color="cyan" />
      <Paragraph paragraph={paragraph} x={0} y={0} width={200} />
    </Canvas>
  );
};
```

<img src={require("/static/img/paragraph/boundingbox-node.png").default} width="256" height="256" />


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

Below is an example to center text with `textAlign` property:

```tsx twoslash
import { useMemo } from "react";
import { Paragraph, Skia, TextAlign, Canvas, Rect } from "@shopify/react-native-skia";

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const para = Skia.ParagraphBuilder.Make({
          textAlign: TextAlign.Center,
      })
      .addText("Say Hello to React Native Skia")
      .build();
    return para;
  }, []);

  // Render the paragraph with the text center
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Paragraph paragraph={paragraph} x={0} y={0} width={200} />
    </Canvas>
  );
};
```

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
