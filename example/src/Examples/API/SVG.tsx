import React from "react";
import { Dimensions } from "react-native";
import { Canvas, ImageSVG, useSVG } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

export const SVG = () => {
  const svg = useSVG(require("./tiger.svg"));
  if (svg === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <ImageSVG svg={svg} x={0} y={0} width={width / 2} height={height / 2} />
    </Canvas>
  );
};
