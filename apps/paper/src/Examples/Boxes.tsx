import React from "react";
import {
  Box,
  BoxShadow,
  Canvas,
  Fill,
  rect,
  rrect,
} from "@shopify/react-native-skia";

export const Boxes = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="#add8e6" />
      <Box box={rrect(rect(64, 64, 128, 128), 24, 24)} color="#add8e6">
        <BoxShadow dx={10} dy={10} blur={10} color="#93b8c4" inner />
        <BoxShadow dx={-10} dy={-10} blur={10} color="#c7f8ff" inner />
        <BoxShadow dx={10} dy={10} blur={10} color="#93b8c4" />
        <BoxShadow dx={-10} dy={-10} blur={10} color="#c7f8ff" />
      </Box>
    </Canvas>
  );
};
