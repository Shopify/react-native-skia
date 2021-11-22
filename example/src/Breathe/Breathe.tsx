import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

export const Breathe = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={100} cy={100} r={100} opacity={0.5} color="red" />
    </Canvas>
  );
};
