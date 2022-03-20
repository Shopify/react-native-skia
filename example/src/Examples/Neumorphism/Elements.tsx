import React from "react";
import { Dimensions } from "react-native";
import { Canvas, Fill, useLoop } from "@shopify/react-native-skia";

import { ProgressBar } from "./components/ProgressBar";

const { width, height } = Dimensions.get("window");
const PADDING = 8;
const size = width - PADDING * 2;
const x = PADDING;
const y = (height - size) / 2;

export const Neumorphism = () => {
  const progress = useLoop({ duration: 5000 });
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="#F0F0F3" />
      <ProgressBar progress={progress} x={x} y={y} width={size} />
    </Canvas>
  );
};
