import React, { useCallback, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { SkColor, TouchInfo } from "@shopify/react-native-skia";
import {
  Fill,
  Canvas,
  Drawing,
  Skia,
  PaintStyle,
  usePaint,
  TouchType,
} from "@shopify/react-native-skia";
import type { DrawingContext } from "@shopify/react-native-skia/src/renderer/DrawingContext";

import { Title } from "./components/Title";

const Colors = [
  "#2D4CD2",
  "#3CF2B5",
  "#A80DD8",
  "#36B6D9",
  "#37FF5E",
  "#CF0CAA",
  "#AFF12D",
  "#D35127",
  "#D01252",
  "#DABC2D",
  "#5819D7",
] as const;

export const Touch = () => {
  const paint = usePaint((p) => {
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeWidth(8);
  });
  const currentTouches = useRef<Array<TouchInfo & { color: SkColor }>>([]);

  const handleTouches = useCallback((touchInfo: Array<Array<TouchInfo>>) => {
    // Loop through touch event history since last repaint (usually just one)
    touchInfo.forEach((touches) => {
      // Add all touches to the current touches array and set a random color
      // on each touch
      touches
        .filter((t) => t.type === TouchType.Start)
        .forEach((t) => {
          const color = Skia.Color(
            Colors[Math.round(Math.random() * (Colors.length - 1))]
          );
          currentTouches.current.push({ ...t, color });
        });

      // Remove touch events for end / cancel
      touches
        .filter(
          (t) => t.type === TouchType.End || t.type === TouchType.Cancelled
        )
        .forEach((t) => {
          currentTouches.current = currentTouches.current.filter(
            (p) => p.id !== t.id
          );
        });

      // Update all remaining active touches
      touches
        .filter((t) => t.type === TouchType.Active)
        .forEach((t) => {
          const index = currentTouches.current.findIndex((p) => p.id === t.id);
          if (index >= 0) {
            currentTouches.current[index] = {
              ...currentTouches.current[index],
              ...t,
            };
          }
        });
    });
  }, []);

  const handleDraw = useCallback(
    (ctx: DrawingContext) => {
      // Draw an indicator for all of the active touches
      currentTouches.current.forEach((t) => {
        if (t.type === TouchType.Active || t.type === TouchType.Start) {
          paint.setColor(t.color);
          ctx.canvas.drawCircle(t.x, t.y, 40, paint);
        }
      });
    },
    [paint]
  );

  return (
    <View style={styles.container}>
      <Title>Touch handling</Title>
      <Canvas style={styles.container} onTouch={handleTouches}>
        <Fill color="white" />
        <Drawing drawing={handleDraw} />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
