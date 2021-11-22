import React from "react";
import { Canvas, Circle } from "@shopify/react-native-skia";

export const Breathe = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={100} cy={100} r={100} color="red" />
    </Canvas>
  );
};
