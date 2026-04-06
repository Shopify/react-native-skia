<<<<<<< HEAD
import React, { useState } from "react";
import type { LayoutRectangle } from "react-native";
import { Text } from "react-native";
import { Canvas, Fill } from "@shopify/react-native-skia";

export const OnLayoutDemo = () => {
  const [layout, setLayout] = useState<LayoutRectangle>();
  return (
    <>
      <Text>{`OnLayout: ${layout?.width} / ${layout?.height}`}</Text>
      <Canvas
        style={{ flex: 1 }}
        onLayout={(evt) => setLayout(evt.nativeEvent.layout)}
      >
=======
import React from "react";
import { Text } from "react-native";
import { Canvas, Fill, useCanvasSize } from "@shopify/react-native-skia";

export const OnLayoutDemo = () => {
  const { ref, size } = useCanvasSize();
  return (
    <>
      <Text>{`OnLayout: ${size?.width} / ${size?.height}`}</Text>
      <Canvas style={{ flex: 1 }} ref={ref}>
>>>>>>> main
        <Fill color="red" />
      </Canvas>
    </>
  );
};
