import React, { useEffect, useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import type { SkTextStyle } from "@shopify/react-native-skia";
import {
  Canvas,
  FontSlant,
  FontWeight,
  Group,
  PaintStyle,
  Paragraph,
  Rect,
  Skia,
  TextDecoration,
  mix,
  useFonts,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Paragraphs = () => {
  const { height, width } = useWindowDimensions();
  const progress = useSharedValue(1);

  useEffect(() => {
    progress.value = withRepeat(withTiming(0, { duration: 3000 }), -1, true);
  }, [progress]);

  const loopedWidth = useDerivedValue(
    () => mix(progress.value, width * 0.2, width * 0.8),
    [progress]
  );

  const customFontMgr = useFonts({
    Roboto: [
      require("../../Tests/assets/Roboto-Medium.ttf"),
      require("../../Tests/assets/Roboto-Regular.ttf"),
    ],
    UberMove: [require("../../Tests/assets/UberMove-Medium_mono.ttf")],
  });

  const paragraph = useMemo(() => {
    if (customFontMgr === null) {
      return null;
    }

    const fontSize = 20;
    const paragraphBuilder =
      Skia.ParagraphBuilder.MakeFromFontProvider(customFontMgr);
    const strokePaint = Skia.Paint();
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(1);

    const textStyle = {
      fontSize,
      fontFamilies: ["Roboto"],
      color: Skia.Color("#000"),
    };

    const coloredTextStyle = {
      fontSize: fontSize * 1.3,
      fontFamilies: ["Roboto"],
      color: Skia.Color("#61bea2"),
    };

    const crazyStyle: SkTextStyle = {
      color: Skia.Color("#000"),
      backgroundColor: Skia.Color("#CECECE"),
      fontSize: fontSize * 1.3,
      fontFamilies: ["Roboto"],
      letterSpacing: -1,
      wordSpacing: 20,
      fontStyle: {
        slant: FontSlant.Italic,
        weight: FontWeight.ExtraBlack,
      },
      shadows: [
        {
          color: Skia.Color("#00000044"),
          blurRadius: 4,
          offset: { x: 4, y: 4 },
        },
      ],
      decorationColor: Skia.Color("#00223A"),
      decorationThickness: 2,
      decoration: 1,
      decorationStyle: TextDecoration.Overline,
    };

    paragraphBuilder
      .pushStyle(textStyle)
      .addText("Hello Skia! 🥳\n\nThis text rendered using the ")
      .pushStyle(coloredTextStyle)
      .addText("SkParagraph ")
      .pop()
      .addText("module with ");

    const altColoredTextStyle = {
      ...coloredTextStyle,
      color: Skia.Color("#f5a623"),
    };

    const retVal = paragraphBuilder
      .pushStyle(altColoredTextStyle)
      .addText("libgrapheme ")
      .pop()
      .addText("on iOS.")
      .pushStyle(textStyle)
      .addText(
        "\n\nOn Android we use built-in ICU while on web we use CanvasKit's."
      )
      .pop()
      .pushStyle(crazyStyle, strokePaint)
      .addText("\n\nWow - this is cool.")
      .pop()
      .build();

    return retVal;
  }, [customFontMgr]);

  return (
    <ScrollView>
      <Canvas
        style={{
          width,
          height,
        }}
      >
        <Group transform={[{ translateX: 30 }, { translateY: 30 }]}>
          <Paragraph paragraph={paragraph} x={0} y={0} width={loopedWidth} />
          <Rect x={loopedWidth} y={0} width={1} height={300} />
        </Group>
      </Canvas>
    </ScrollView>
  );
};
