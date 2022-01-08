import {
  BlurMask,
  Canvas,
  Fill,
  Paint,
  Skia,
  useTypeface,
} from "@shopify/react-native-skia";
import React from "react";

import { COLS, ROWS, Symbol, SYMBOL } from "./Symbol";

const cols = new Array(COLS).fill(0);
const rows = new Array(ROWS).fill(0);

const useMatrixFont = () => {
  const typeface = useTypeface(require("./matrix-code-nfi.otf"));
  if (typeface === null) {
    return null;
  }
  return Skia.Font(typeface, SYMBOL.height);
};

export const Matrix = () => {
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
          <Symbol key={`${i}-${j}`} i={i} j={j} font={font} />
        ))
      )}
    </Canvas>
  );
};
