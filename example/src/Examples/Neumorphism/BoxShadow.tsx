import React from "react";
import {
  FitBox,
  Path,
  Paint,
  Box,
  Canvas,
  Fill,
  vec,
  rrect,
  rect,
  Shadow,
  BoxShadow,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const r = 150;
const c = vec(width / 2, r);

const rct = rrect(rect(c.x - r, c.y - r, 2 * r, 2 * r), r, r);

export const Neumorphism = () => {
  const dx = 10;
  const dy = 10;
  return (
    <Canvas style={{ flex: 1 }} mode="continuous" debug>
      <Fill color="lightblue" />
      <Box box={rct} color="white">
        <BoxShadow dx={-dx} dy={-dy} blur={15} color="blue" />
        <BoxShadow dx={dx} dy={dy} blur={15} color="green" inner />
      </Box>
      <FitBox src={rect(0, 0, 24, 24)} dst={rect(50, 350, 300, 300)}>
        <Paint>
          <Shadow dx={1} dy={1} blur={1} color="red" inner />
          <Shadow dx={1} dy={1} blur={1} color="blue" />
        </Paint>
        <Path
          path="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"
          color="white"
        />
      </FitBox>
    </Canvas>
  );
};
