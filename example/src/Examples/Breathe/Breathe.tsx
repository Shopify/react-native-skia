import React, { useRef } from "react";
import { SkiaView, useDrawCallback } from "@shopify/react-native-skia";

export const Breathe = () => {
  const init = useRef(false);
  const onDraw = useDrawCallback((canvas) => {
    if (!init.current) {
      init.current = true;
      canvas.init3DScene();
    }
    canvas.draw3DScene();
  });
  return <SkiaView style={{ flex: 1 }} onDraw={onDraw} mode="continuous" />;
};
