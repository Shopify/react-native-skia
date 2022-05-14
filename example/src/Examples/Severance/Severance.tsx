import {
  Canvas,
  Fill,
  Group,
  Offset,
  Paint,
  rect,
  Rect,
  Shader,
  Skia,
  Text,
  useFont,
  usePaintRef,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { CRT } from "./CRT";
import { BG, FG } from "./Theme";

const { width, height } = Dimensions.get("window");
export const COLS = 5;
export const ROWS = 10;
export const SIZE = { width: width / COLS, height: height / ROWS };
const rows = new Array(Math.round(width / COLS)).fill(0).map((_, i) => i);
const cols = new Array(Math.round(height / ROWS)).fill(0).map((_, i) => i);
const F = 0.009;

export const Severance = () => {
  const font = useFont(require("./SF-Mono-Medium.otf"), 32);
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <CRT rect={rect(0, 0, width, height)}>
        <Fill color={BG} />
        {rows.map((_i, i) =>
          cols.map((_j, j) => {
            const x = i * SIZE.width;
            const y = j * SIZE.height;
            return (
              <Rect
                key={`${i}-${j}`}
                x={x + 10}
                y={y + 10}
                width={SIZE.width - 20}
                height={SIZE.height - 20}
                color={FG}
              />
            );
            // return (
            //   <Text
            //     key={`${i}-${j}`}
            //     text="0"
            //     x={x}
            //     y={y}
            //     font={font}
            //     color={FG}
            //   />
            // );
          })
        )}
      </CRT>
    </Canvas>
  );
};
