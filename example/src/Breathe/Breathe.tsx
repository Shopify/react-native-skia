import React from "react";
import { Canvas, Circle } from "@shopify/react-native-skia";

export const Breathe = () => {
  return (
    <Canvas>
      <Circle cx={0} cy={0} r={100} color="red" />
    </Canvas>
  );
};
