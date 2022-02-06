import {
  Canvas,
  Paint,
  Image,
  ColorMatrix,
  useImage,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const Filters = () => {
  const image = useImage(require("../../assets/oslo.jpg"));
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <ColorMatrix
          matrix={[
            -0.843, 2.18, 0.155, 0.0, -0.247, 0.627, 0.634, 0.233, 0.0, -0.247,
            0.687, 2.09, -1.28, 0.0, -0.247, 0.0, 0.0, 0.0, 1.0, 0.0,
          ]}
        />
      </Paint>
      <Image
        x={0}
        y={0}
        width={width}
        height={height}
        image={image}
        fit="cover"
      />
    </Canvas>
  );
};
