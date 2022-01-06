import {
  BlurMask,
  Canvas,
  Fill,
  Paint,
  Skia,
  useProgress,
  useTypeface,
} from "@shopify/react-native-skia";
import React from "react";

import { COLS, ROWS, Glyph, GLYPH } from "./Glyph";

const arr = (from: number, to: number, blank?: boolean) => {
  const length = from + Math.floor(Math.random() * (to - from));
  return Array.from({ length }, (_, i) => (blank ? 0 : i / length));
};
const cols = new Array(COLS).fill(0);
const rows = new Array(ROWS).fill(0);
const streams = cols.map((_, i) => {
  return new Array(3)
    .fill(0)
    .map(() => {
      const input = [arr(8, 16), arr(4, 8, true)];
      return i % 2 === 0 ? input.reverse() : input;
    })
    .flat(2);
});

const useMatrixFont = () => {
  const typeface = useTypeface(require("./matrix-code-nfi.otf"));
  if (typeface === null) {
    return null;
  }
  return Skia.Font(typeface, GLYPH.height);
};

export const Matrix = () => {
  const progress = useProgress();
  const font = useMatrixFont();
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Paint>
        <BlurMask sigma={10} style="solid" />
      </Paint>
      {cols.map((_i, i) =>
        rows.map((_j, j) => (
          <Glyph
            progress={progress}
            key={`${i}-${j}`}
            i={i}
            j={j}
            stream={streams[i]}
            font={font}
          />
        ))
      )}
    </Canvas>
  );
};
