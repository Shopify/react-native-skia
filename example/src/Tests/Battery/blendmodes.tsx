import React from "react";
import {
  BlendMode,
  enumKey,
  Group,
  Rect,
  Skia,
} from "@shopify/react-native-skia";

import type { SingleTest, Tests } from "../types";

const blendModes = [
  "clear",
  "src",
  "dst",
  "srcOver",
  "dstOver",
  "srcIn",
  "dstIn",
  "srcOut",
  "dstOut",
  "srcATop",
  "dstATop",
  "xor",
  "plus",
  "modulate",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "colorDodge",
  "colorBurn",
  "hardLight",
  "softLight",
  "difference",
  "exclusion",
  "multiply",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

export const BlendModes: Tests = blendModes.reduce((acc, current) => {
  acc[current] = {
    component: ({ width, height }) => {
      const paint = Skia.Paint();
      paint.setBlendMode(BlendMode[enumKey(current)]);
      return (
        <Group layer>
          <Rect
            x={0}
            y={0}
            width={width * 0.75}
            height={height * 0.75}
            color="purple"
          />
          <Group layer={paint}>
            <Rect
              x={width * 0.25}
              y={height * 0.25}
              width={width * 0.75}
              height={height * 0.75}
              color="lightblue"
            />
          </Group>
        </Group>
      );
    },
  };
  return acc;
}, {} as { [key: string]: SingleTest });
