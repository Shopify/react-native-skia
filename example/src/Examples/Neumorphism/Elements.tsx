import React from "react";
import { Dimensions } from "react-native";
import { Canvas, Fill } from "@shopify/react-native-skia";

import { Button } from "./components/Button";

const { width, height } = Dimensions.get("window");
const PADDING = 64;
const size = width - PADDING * 2;
const x = PADDING;
const y = (height - size) / 2;

export const Neumorphism = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#F0F0F3" />
      <Button x={x} y={y} size={size} />
    </Canvas>
  );
};
