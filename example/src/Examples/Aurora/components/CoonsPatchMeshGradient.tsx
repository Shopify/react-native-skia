import type { Vector } from "@shopify/react-native-skia";
import {
  add,
  Fill,
  dist,
  useTouchHandler,
  useValue,
  Paint,
  mixColors,
  Canvas,
  Patch,
  processColor,
  vec,
} from "@shopify/react-native-skia";
import React from "react";

import { BilinearGradient } from "./BilinearGradient";
import { Cubic } from "./Cubic";

const C = 0; //50;
const inRadius = (a: Vector, b: Vector, r = 20) => dist(a, b) < r;

const bilinearInterpolate = (
  [color0, color1, color2, color3]: number[],
  size: Vector,
  pos: Vector
) => {
  const uv = vec(pos.x / size.x, pos.y / size.y);
  const colorA = mixColors(uv.x, color0, color1);
  const colorB = mixColors(uv.x, color2, color3);
  return mixColors(uv.y, colorA, colorB);
};

interface CoonsPatchMeshGradientProps {
  colors: [string, string, string, string];
  rows: number;
  cols: number;
  width: number;
  height: number;
}

export const CoonsPatchMeshGradient = ({
  colors: rawColors,
  rows: rowNum,
  cols: colNum,
  width,
  height,
}: CoonsPatchMeshGradientProps) => {
  const colors = rawColors.map((color) => processColor(color, 1));
  const dx = width / colNum;
  const dy = height / rowNum;
  const rows = new Array(rowNum).fill(0).map((_, i) => i);
  const cols = new Array(colNum).fill(0).map((_, i) => i);
  const size = vec(width, height);
  const flatMesh = [...rows, rowNum].map((row) =>
    [...cols, colNum].map((col) => {
      const src = vec(dx * col, dy * row);
      return {
        src,
        c1: add(src, vec(0, C)),
        c2: add(src, vec(C, 0)),
      };
    })
  );
  const nonEdges = flatMesh
    .map((row, i) =>
      row.map(({ src: { x, y } }, col) => ({
        row: i,
        col,
        edge: x === 0 || y === 0 || x === width || y === height,
      }))
    )
    .flat()
    .filter(({ edge }) => !edge);
  const mesh = useValue(flatMesh);
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      nonEdges.forEach(({ row, col }) => {
        const { src, c1, c2 } = mesh.value[row][col];
        if (inRadius(pt, src)) {
          mesh.value[row][col] = {
            src: pt,
            c1,
            c2,
          };
          mesh.value = [...mesh.value];
        } else if (inRadius(pt, c1)) {
          mesh.value[row][col] = {
            src,
            c1: pt,
            c2,
          };
          mesh.value = [...mesh.value];
        } else if (inRadius(pt, c2)) {
          mesh.value[row][col] = {
            src,
            c1,
            c2: pt,
          };
          mesh.value = [...mesh.value];
        }
      });
    },
  });
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Paint>
        <BilinearGradient colors={colors} size={size} />
      </Paint>
      {rows.map((row) =>
        cols.map((col) => (
          <Patch
            key={`patch-${row}-${col}`}
            patch={() => [
              mesh.value[row][col],
              mesh.value[row][col + 1],
              mesh.value[row + 1][col + 1],
              mesh.value[row + 1][col],
            ]}
            textures={[
              flatMesh[row][col].src,
              flatMesh[row][col + 1].src,
              flatMesh[row + 1][col + 1].src,
              flatMesh[row + 1][col].src,
            ]}
          />
        ))
      )}
      {nonEdges.map(({ row, col }) => {
        const color = bilinearInterpolate(
          colors,
          size,
          mesh.value[row][col].src
        );
        return (
          <Cubic
            key={`cubic-${row}-${col}`}
            mesh={mesh}
            row={row}
            col={col}
            color={color}
          />
        );
      })}
    </Canvas>
  );
};
