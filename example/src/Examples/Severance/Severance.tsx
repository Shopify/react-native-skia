import {
  Canvas,
  Fill,
  Group,
  Rect,
  useClockValue,
  useFont,
  useDerivedValue,
  Text,
  useTouchHandler,
  useValue,
  vec,
  mix,
  dist,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { CRT } from "./CRT";
import { COLS, ROWS, SIZE, Symbol } from "./Symbol";
import { BG } from "./Theme";

const rows = new Array(Math.round(COLS)).fill(0).map((_, i) => i);
const cols = new Array(Math.round(ROWS)).fill(0).map((_, i) => i);

export const Severance = () => {
  const clock = useClockValue();
  const font = useFont(require("./SF-Mono-Medium.otf"), SIZE.height);
  const pointer = useValue({ x: 0, y: 0 });
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      pointer.current = pt;
    },
  });
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch} debug>
      <Group>
        <Fill color={BG} />
        {rows.map((_i, i) =>
          cols.map((_j, j) => {
            const x = i * SIZE.width;
            const y = j * SIZE.height;
            return (
              <Symbol
                key={`${i}-${j}`}
                x={x}
                y={y}
                font={font}
                pointer={pointer}
              />
            );
          })
        )}
      </Group>
    </Canvas>
  );
};
