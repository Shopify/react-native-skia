import React from "react";
import { Circle, Rect, RoundedRect } from "@shopify/react-native-skia";

import type { Tests } from "../types";

export const Shapes: Tests = {
  Rect: {
    component: ({ width, height }) => {
      return (
        <Rect
          x={width / 4}
          y={height / 4}
          width={width / 2}
          height={height / 2}
          color={"red"}
        />
      );
    },
  },
  RoundedRect: {
    component: ({ width, height }) => {
      return (
        <RoundedRect
          x={width / 4}
          y={height / 4}
          width={width / 2}
          height={height / 2}
          color={"green"}
          r={10}
        />
      );
    },
  },
  Circle: {
    component: ({ width, height }) => {
      return (
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width / 4, height / 4)}
          color={"blue"}
        />
      );
    },
  },
};
