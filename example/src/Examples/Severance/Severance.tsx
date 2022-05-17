import {
  Canvas,
  Fill,
  Group,
  useClockValue,
  useFont,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { CRT } from "./CRT";
import { COLS, ROWS, SIZE, Symbol } from "./Symbol";
import { BG } from "./Theme";

const { width, height } = Dimensions.get("window");
const rows = new Array(Math.round(COLS)).fill(0).map((_, i) => i);
const cols = new Array(Math.round(ROWS)).fill(0).map((_, i) => i);

export const Severance = () => {
  const clock = useClockValue();
  const font = useFont(require("./SF-Mono-Medium.otf"), SIZE.height);
  const pointer = useValue({ x: width / 2, y: height / 2 });
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
      <CRT>
        <Group>
          <Fill color={BG} />
          {rows.map((_i, i) =>
            cols.map((_j, j) => {
              return (
                <Symbol
                  key={`${i}-${j}`}
                  i={i}
                  j={j}
                  font={font}
                  pointer={pointer}
                  clock={clock}
                />
              );
            })
          )}
        </Group>
      </CRT>
    </Canvas>
  );
};
