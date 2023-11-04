import React, { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  FontSlant,
  FontWeight,
  Paragraph,
  Skia,
  TextDecoration,
  TextDecorationStyle,
} from "@shopify/react-native-skia";

export const Paragraphs = () => {
  const { width } = useWindowDimensions();
  const paragraph = useMemo(() => {
    const fontSize = 20;
    const paragraphBuilder = Skia.ParagraphBuilder.Make();
    const textStyle = Skia.TextStyle.Make();
    const coloredTextStyle = Skia.TextStyle.Make();

    textStyle
      .setFontSize(fontSize)
      .setFontFamilies(["Roboto"])
      .setColor(Skia.Color("#000"));

    coloredTextStyle
      .setFontSize(fontSize * 1.3)
      .setFontFamilies(["Roboto"])
      .setColor(Skia.Color("#61bea2"));

    const crazyStyle = Skia.TextStyle.Make()
      .setColor(Skia.Color("#e42fac"))
      .setBackgroundColor(Skia.Color("#CECECE"))
      .setFontSize(fontSize * 1.3)
      .setFontFamilies(["Roboto"])
      .setLetterSpacing(-1)
      .setWordSpacing(20)
      .setFontSlant(FontSlant.Italic)
      .setShadows([
        {
          color: Skia.Color("#00000044"),
          blurRadius: 4,
          offset: { x: 4, y: 4 },
        },
      ])
      .setDecorationColor(Skia.Color("#00223A"))
      .setDecorationStyle(TextDecorationStyle.Dotted)
      .setDecorationThickness(2)
      .setDecorationType(TextDecoration.LineThrough)
      .setFontWeight(FontWeight.ExtraBlack);

    paragraphBuilder
      .pushStyle(textStyle)
      .addText("Hello Skia!\n\nThis text rendered using the ")
      .pushStyle(coloredTextStyle)
      .addText("SkParagraph ")
      .pop()
      .addText("module with ");

    coloredTextStyle.setColor(Skia.Color("#f5a623"));

    const retVal = paragraphBuilder
      .pushStyle(coloredTextStyle)
      .addText("libgrapheme ")
      .pop()
      .addText("on iOS.")
      .pushStyle(textStyle)
      .addText(
        "\n\nOn Android we use built-in ICU while on web we use CanvasKit's."
      )
      .pop()
      .pushStyle(crazyStyle)
      .addText("\n\nWow - this is cool.")
      .pop()
      .build();

    return retVal;
  }, []);
  return (
    <ScrollView>
      <Canvas
        style={{
          width,
          height: 320,
        }}
      >
        <Paragraph paragraph={paragraph} x={30} y={30} width={width * 0.75} />
      </Canvas>
    </ScrollView>
  );
};
