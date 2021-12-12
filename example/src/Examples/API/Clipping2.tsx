import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  PaintStyle,
  Canvas,
  Image,
  Group,
} from "@shopify/react-native-skia";
import { useImage } from "@shopify/react-native-skia/src/skia/Image/useImage";

const { width } = Dimensions.get("window");
const SIZE = width / 4;
const paint = Skia.Paint();
paint.setAntiAlias(true);
paint.setColor(Skia.Color("#61DAFB"));

const strokePaint = paint.copy();
strokePaint.setStyle(PaintStyle.Stroke);
strokePaint.setStrokeWidth(2);

const star = Skia.Path.MakeFromSVGString(
  // eslint-disable-next-line max-len
  "M 293.4 16 C 266.3 16 244.4 37.9 244.4 65 C 244.4 92.1 266.3 114 293.4 114 C 320.4 114 342.4 92.1 342.4 65 C 342.4 37.9 320.4 16 293.4 16 Z M 311 90.6 L 293.4 81.1 L 275.7 90.6 L 279.2 70.9 L 264.8 57 L 284.6 54.2 L 293.4 36.2 L 302.1 54.2 L 321.9 57 L 307.5 70.9 L 311 90.6 V 90.6 Z"
)!;
const PADDING = 16;
const clipRRect = Skia.RRectXY(
  Skia.XYWHRect(
    PADDING + SIZE + PADDING * 2,
    PADDING * 2,
    SIZE - 2 * PADDING,
    SIZE - 2 * PADDING
  ),
  25,
  25
);

export const Clipping = () => {
  const oslo = useImage(require("../../assets/oslo.jpg"));
  if (oslo === null) {
    return null;
  }
  return (
    <ScrollView>
      <Canvas style={styles.container}>
        <Image
          source={oslo}
          x={PADDING}
          y={PADDING}
          width={SIZE}
          height={SIZE}
          fit="cover"
        />
        <Group clipRect={clipRRect} invertClip>
          <Image
            source={oslo}
            x={SIZE + 2 * PADDING}
            y={PADDING}
            width={SIZE}
            height={SIZE}
            fit="cover"
          />
        </Group>
        <Group clipPath={star}>
          <Image
            source={oslo}
            x={2 * SIZE + 3 * PADDING}
            y={PADDING}
            width={SIZE}
            height={SIZE}
            fit="cover"
          />
        </Group>
      </Canvas>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: SIZE + 32,
  },
});
