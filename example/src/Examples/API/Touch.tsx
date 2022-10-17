import React from "react";
import { useWindowDimensions, View } from "react-native";
import type { SkColor, TouchInfo } from "@shopify/react-native-skia";
import {
  createPicture,
  PaintStyle,
  useValue,
  Picture,
  useComputedValue,
  useMultiTouchHandler,
  Fill,
  Canvas,
  Skia,
  TouchType,
} from "@shopify/react-native-skia";

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

const paint = Skia.Paint();
paint.setStyle(PaintStyle.Stroke);
paint.setStrokeWidth(8);

export const Touch = () => {
  const { width, height } = useWindowDimensions();
  // Store current touches together with their color
  const currentTouches = useValue<Array<TouchInfo & { color: SkColor }>>([]);

  const handleTouches = useMultiTouchHandler({
    onStart: (t) => {
      // Add specific color to the given touch (tracked by touch.id)
      const color = Skia.Color(
        Colors[Math.round(Math.random() * (Colors.length - 1))]
      );
      currentTouches.current.push({ ...t, color });
      currentTouches.current = [...currentTouches.current];
    },
    onActive: (t) => {
      // Updated the touch with the new position
      const index = currentTouches.current.findIndex((p) => p.id === t.id);
      if (index >= 0) {
        currentTouches.current[index] = {
          ...currentTouches.current[index],
          ...t,
        };
        currentTouches.current = [...currentTouches.current];
      }
    },
    onEnd: (t) => {
      // Remove the touch from the list of touch/colors
      currentTouches.current = currentTouches.current.filter(
        (p) => p.id !== t.id
      );
      currentTouches.current = [...currentTouches.current];
    },
  });

  const picture = useComputedValue(
    () =>
      createPicture(Skia.XYWHRect(0, 0, width, height), (canvas) => {
        currentTouches.current.forEach((t) => {
          if (t.type === TouchType.Active || t.type === TouchType.Start) {
            paint.setColor(t.color);
            canvas.drawCircle(t.x, t.y, 40, paint);
          }
        });
      }),
    [currentTouches]
  );

  return (
    <View style={{ flex: 1 }}>
      <Title>Touch handling</Title>
      <Canvas style={{ width, height }} onTouch={handleTouches}>
        <Fill color="white" />
        <Picture picture={picture} />
      </Canvas>
    </View>
  );
};
