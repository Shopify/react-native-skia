import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Skia,
  usePaint,
  useDrawCallback,
  useFont,
  SkiaView,
} from "@shopify/react-native-skia";

import { Animation } from "../../Animation";

const Size = 30;
const Padding = 2.5;

export const AnimationExample: React.FC = () => {
  const paint = usePaint((p) => p.setColor(Skia.Color("#7FC8A9")));
  const foregroundPaint = usePaint((p) => p.setColor(Skia.Color("#8A0707")));
  const font = useFont();

  const { width, height } = useWindowDimensions();
  const boxes = useMemo(() => {
    const rowCount = Math.floor(height / (Size + Padding));
    const colCount = Math.floor(width / (Size + Padding));
    console.log(rowCount * colCount);
    return new Array(rowCount * colCount)
      .fill(rowCount * colCount)
      .map((_, i) => {
        const row = i % rowCount;
        const col = i % colCount;
        return { x: col * (Size + Padding), y: row * (Size + Padding) };
      });
  }, [height, width]);

  const rect = useMemo(
    () => Skia.XYWHRect(-Size / 2, -Size / 2, Size, Size),
    []
  );

  const centerPoint = useMemo(
    () => ({ x: width / 2, y: height / 2 }),
    [width, height]
  );

  const onDraw = useDrawCallback(
    (canvas, info) => {
      canvas.drawPaint(paint);
      // Normalize the timestamp to a value between 0 and 1 with a duration of 2 seconds
      const t = Animation.Easing.inOut(
        Animation.normalize(info.timestamp, { durationSeconds: 2.5 })
      );

      // Interpolate scaling
      const scale = Animation.interpolate(
        t,
        [0, 0.25, 0.5, 0.75, 1],
        [1, 0, 1, 0, 1],
        Animation.Extrapolate.CLAMP
      );

      boxes.forEach((box) => {
        canvas.save();
        canvas.translate(
          box.x + Size / 2 + Padding,
          box.y + Size / 2 + Padding
        );
        // Stagger
        const a = box.x + Size / 2 - centerPoint.x;
        const b = box.y + Size / 2 - centerPoint.y;
        const distance = Math.sqrt(a * a + b * b);
        const normalizedDistance = Math.min(1.0, distance / (height / 2));
        const finalScale = Math.min(1.0, scale + normalizedDistance);
        canvas.scale(finalScale, finalScale);
        canvas.drawRect(rect, foregroundPaint);
        canvas.restore();
      });
    },
    [paint, foregroundPaint, font]
  );

  return (
    <SkiaView style={styles.skiaview} onDraw={onDraw} mode="continuous" debug />
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
  },
});
