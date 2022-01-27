import { Canvas, Patch, vec } from "@shopify/react-native-skia";
import React from "react";

interface CoonsPatchMeshGradientProps {
  colors: [string, string, string, string];
  rows: number;
  cols: number;
  width: number;
  height: number;
}

export const CoonsPatchMeshGradient = ({
  colors,
  rows: rowNum,
  cols: colNum,
  width,
  height,
}: CoonsPatchMeshGradientProps) => {
  const dx = width / colNum;
  const dy = height / rowNum;
  const rows = new Array(rowNum).fill(0).map((_, i) => i);
  const cols = new Array(colNum).fill(0).map((_, i) => i);
  return (
    <Canvas style={{ width, height }}>
      {rows.map((row) =>
        cols.map((col) => {
          const tl = vec(dx * col, dy * row);
          const tr = vec(dx * col + dx, dy * row);
          const br = vec(dx * col + dx, dy * row + dy);
          const bl = vec(dx * col, dy * row + dy);
          const topLeft = {
            src: tl,
            c1: tl,
            c2: tl,
          };
          const topRight = {
            src: tr,
            c1: tr,
            c2: tr,
          };
          const bottomRight = {
            src: br,
            c1: br,
            c2: br,
          };
          const bottomLeft = {
            src: bl,
            c1: bl,
            c2: bl,
          };
          return (
            <Patch
              colors={colors}
              cubics={[topLeft, topRight, bottomRight, bottomLeft]}
            />
          );
        })
      )}
    </Canvas>
  );
};
