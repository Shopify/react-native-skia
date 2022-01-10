import React from "react";
import { Dimensions } from "react-native";
import { Canvas, Drawing, useSVG } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

export const SVG = () => {
  const svg = useSVG(require("./tiger.svg"));
  if (svg === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Drawing onDraw={({ canvas }) => canvas.drawSvg(svg, width, height)} />
    </Canvas>
  );
};
