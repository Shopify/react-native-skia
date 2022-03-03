import {
  Canvas,
  DropShadow,
  Fill,
  Group,
  Paint,
  RoundedRect,
} from "@shopify/react-native-skia";
import React from "react";

const PADDING = 32;
const SIZE = 256 - 64;
const R = 32;

export const Neumorphism = () => {
  return (
    <Canvas style={{ width: 256, height: 256 }}>
      <Fill color="lightblue" />
      <Group>
        <Paint>
          <DropShadow dx={12} dy={12} sigmaX={25} sigmaY={25} color="#93b8c4">
            <DropShadow
              dx={-12}
              dy={-12}
              sigmaX={25}
              sigmaY={25}
              color="#c7f8ff"
            />
          </DropShadow>
        </Paint>
        <RoundedRect
          x={PADDING}
          y={PADDING}
          width={SIZE}
          height={SIZE}
          rx={R}
          color="lightblue"
        />
      </Group>
    </Canvas>
  );
};
