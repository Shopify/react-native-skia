import {
  BlurMask,
  Canvas,
  Fill,
  Paint,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import { useTimestamp } from "@shopify/react-native-skia/src/animation/Animation/hooks";

import { COLS, ROWS, Symbol, SYMBOL } from "./Symbol";

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);

const randomArray = (from: number, to: number, blank?: boolean) => {
  const size = Math.round(from + Math.random() * (to - from));
  const a = new Array(size).fill(0).map((_, i) => (blank ? 0 : i / size));
  return a.reverse();
};

const streams = cols.map(() =>
  new Array(3)
    .fill(0)
    .map(() => [
      ...randomArray(1, 4, true),
      ...randomArray(4, 16),
      ...randomArray(2, 8, true),
    ])
    .flat()
);

export const Matrix = () => {
  const timestamp = useTimestamp();
  const font = useFont(require("./matrix-code-nfi.otf"), SYMBOL.height);
  if (font === null) {
    return null;
  }
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Paint>
        <BlurMask sigma={8} style="solid" />
      </Paint>
      {cols.map((_i, i) =>
        rows.map((_j, j) => (
          <Symbol
            symbols={symbols}
            font={font}
            timestamp={timestamp}
            key={`${i}-${j}`}
            i={i}
            j={j}
            stream={streams[i]}
          />
        ))
      )}
    </Canvas>
  );
};
