import {
  DropShadow,
  Canvas,
  Fill,
  Group,
  Paint,
  RoundedRect,
  Rect,
  BoxShadow,
  rect,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const PADDING = 32;
const SIZE = 256 - 64;
const R = 32;
const rct = rect(32, height / 2 - 100, 300, 300);

export const Neumorphism = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="lightblue" />
      <Rect x={width / 2} y={0} width={width / 2} height={height} color="red" />
      <Group>
        <Paint>
          <BoxShadow dx={4} dy={4} blur={10} color="rgba(0, 0, 0, 0.5)" />
        </Paint>
        <Rect rect={rct} color="rgba(255, 255, 255, 0.59)" />
      </Group>
    </Canvas>
  );
};
