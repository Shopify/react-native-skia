import React, { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Canvas, Paragraph, Skia } from "@shopify/react-native-skia";

export const Paragraphs = () => {
  const { width } = useWindowDimensions();
  const paragraph = useMemo(() => {
    const fontSize = 20;
    const paragraphBuilder = Skia.ParagraphBuilder.Make();
    const textStyle = Skia.TextStyle.Make();
    const coloredTextStyle = Skia.TextStyle.Make();

    textStyle
      .setFontSize(fontSize)
      .setFontFamilies(["Helvetica"])
      .setColor(Skia.Color("#000"));

    coloredTextStyle
      .setFontSize(fontSize * 1.3)
      .setFontFamilies(["Helvetica"])
      .setColor(Skia.Color("#61bea2"));

    paragraphBuilder
      .pushStyle(textStyle)
      .addText("Hello Skia!\n")
      .addText("This text rendered using the ")
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
      .addText("\n\nOn other platforms it uses the default implementations.")
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
