import React from "react";
import { StyleSheet } from "react-native";
import {
  Skia,
  usePaint,
  useDrawCallback,
  useFont,
  SkiaView,
} from "@shopify/react-native-skia";

import { Animation } from "../../Animation";

const Size = 25;

export const AnimationExample: React.FC = () => {
  const paint = usePaint((p) => p.setColor(Skia.Color("#7FC8A9")));
  const foregroundPaint = usePaint((p) => p.setColor(Skia.Color("#7F33A9")));
  const font = useFont();

  const onDraw = useDrawCallback(
    (canvas, info) => {
      canvas.drawPaint(paint);
      // Normalize the timestamp to a value between 0 and 1 with a duration of 2 seconds
      let t = Animation.normalize(info.timestamp, { durationSeconds: 2 });

      // Apply easing
      t = Animation.Easing.inOut(t);

      // Interpolate X/Y on the eased t value
      const posX = Animation.interpolate(
        t,
        [0, 0.5, 1],
        [0, info.width - Size, 0],
        Animation.Extrapolate.CLAMP
      );
      const posY = Animation.interpolate(
        t,
        [0, 0.5, 1],
        [0, info.height - Size, 0],
        Animation.Extrapolate.CLAMP
      );

      // Draw the circle
      canvas.drawCircle(posX, posY, Size, foregroundPaint);
    },
    [paint, foregroundPaint, font]
  );

  return <SkiaView style={styles.skiaview} onDraw={onDraw} mode="continuous" />;
};

const styles = StyleSheet.create({
  skiaview: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
  },
});
