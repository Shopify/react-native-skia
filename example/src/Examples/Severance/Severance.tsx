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
import { useWindowDimensions } from "react-native";

import { CRT } from "./CRT";
import { COLS, ROWS, Symbol } from "./Symbol";
import { BG } from "./Theme";

const rows = new Array(COLS).fill(0).map((_, i) => i);
const cols = new Array(ROWS).fill(0).map((_, i) => i);

export const Severance = () => {
  const { width, height } = useWindowDimensions();
  const clock = useClockValue();
  const font = useFont(require("./SF-Mono-Medium.otf"), height / ROWS);
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
