import React from "react";
import { Dimensions } from "react-native";
import { Canvas, ImageSVG, Skia, useSVG } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

const svg = Skia.SVG.MakeFromString(
  "<svg width='290' height='500' viewBox='0 0 290 500' xmlns='http://www.w3.org/2000/svg'><circle cx='31' cy='325' r='120px' fill='#c02aaa'/></svg>"
);

export const SVG = () => {
  // const svg = useSVG(require("./tiger.svg"));
  if (svg === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <ImageSVG
        source={svg}
        x={0}
        y={0}
        width={width / 2}
        height={height / 2}
      />
    </Canvas>
  );
};
