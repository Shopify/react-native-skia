import {
  Canvas,
  Paint,
  usePaintRef,
  Image,
  ColorMatrix,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const Filters = () => {
  const paint = usePaintRef();
  return (
    <Canvas style={{ width, height }}>
      <Paint ref={paint}>
        <ColorMatrix
          value={[
            -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
            -0.703, 0, 0, 0, 0, 0, 1, 0,
          ]}
        />
      </Paint>
      <Image
        x={0}
        y={0}
        width={width}
        height={height}
        source={require("../assets/oslo.jpg")}
        fit="cover"
        paint={paint}
      />
    </Canvas>
  );
};
