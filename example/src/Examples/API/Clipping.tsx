import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Skia,
  useDrawCallback,
  SkiaView,
  PaintStyle,
  useImage,
  ClipOp,
} from "@shopify/react-native-skia";

const oslo = require("../../assets/oslo.jpg");

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

export const Clipping = () => {
  const image = useImage(oslo);
  const onRectDraw = useDrawCallback((canvas) => {
    if (!image) {
      return;
    }
    const imgRect = Skia.XYWHRect(0, 0, image.width(), image.height());
    const PADDING = 16;
    const rect1 = Skia.XYWHRect(PADDING, PADDING, SIZE, SIZE);
    const clipRect = Skia.XYWHRect(
      PADDING * 2,
      PADDING * 2,
      SIZE - 2 * PADDING,
      SIZE - 2 * PADDING
    );
    const rect2 = Skia.XYWHRect(2 * PADDING + SIZE, PADDING, SIZE, SIZE);
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
    const rect3 = Skia.XYWHRect(3 * PADDING + 2 * SIZE, PADDING, SIZE, SIZE);
    console.log({ rect3 });
    if (image) {
      canvas.save();
      canvas.clipRect(clipRect, ClipOp.Difference, true);
      canvas.drawImageRect(image, imgRect, rect1, paint);
      canvas.restore();
      canvas.save();
      canvas.clipRRect(clipRRect, ClipOp.Difference, true);
      canvas.drawImageRect(image, imgRect, rect2, paint);
      canvas.restore();
      canvas.save();
      canvas.clipPath(star, ClipOp.Intersect, true);
      canvas.drawImageRect(image, imgRect, rect3, paint);
      canvas.restore();
    }
  }, []);

  return (
    <ScrollView>
      <SkiaView style={styles.container} onDraw={onRectDraw} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: SIZE + 32,
  },
});
