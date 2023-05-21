import React from "react";
import { SkiaView, useDrawCallback } from "@shopify/react-native-skia";

export const Breathe = () => {
  const onDraw = useDrawCallback((canvas) => {
    canvas.draw3DScene();
  });
  return <SkiaView style={{ flex: 1 }} onDraw={onDraw} />;
};
