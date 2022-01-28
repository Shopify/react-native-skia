import type { Vector } from "@shopify/react-native-skia";
import {
  Paint,
  processColorAsUnitArray,
  Circle,
  mix,
  Canvas,
  Patch,
  processColor,
  vec,
} from "@shopify/react-native-skia";
import React from "react";

import { BilinearGradient } from "./BilinearGradient";

const bilinearInterpolate = (
  [color0, color1, color2, color3]: number[],
  size: Vector,
  pos: Vector
) => {
  const uv = vec(pos.x / size.x, pos.y / size.y);
  const colorA = mix(uv.x, color0, color1);
  const colorB = mix(uv.x, color2, color3);
  return mix(uv.y, colorA, colorB);
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
  const patches = rows
    .map((row) =>
      cols.map((col) => {
        const x = dx * col;
        const y = dy * row;
        const tl = vec(x, y);
        const tr = vec(x + dx, y);
        const br = vec(x + dx, y + dy);
        const bl = vec(x, y + dy);
        // const tlCl = bilinearInterpolate(colors, size, tl);
        // const trCl = bilinearInterpolate(colors, size, tr);
        // const brCl = bilinearInterpolate(colors, size, br);
        // const blCl = bilinearInterpolate(colors, size, bl);
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
        return [topLeft, topRight, bottomRight, bottomLeft] as const;
      })
    )
    .flat();
  const nonEdges = patches
    .flat()
    .map(({ src }) => src)
    .filter(({ x, y }) => !(x === 0 || y === 0 || x === width || y === height))
    .reduce((acc, { x, y }) => {
      const found = acc.find((v) => v.x === x && v.y === y);
      if (!found) {
        acc.push({ x, y });
      }
      return acc;
    }, [] as Vector[]);
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <BilinearGradient
          colors={colors}
          rect={{ x: 0, y: 0, width, height }}
        />
      </Paint>
      {patches.map((patch, key) => (
        <Patch key={key} patch={patch} />
      ))}
      {nonEdges.map((pos, key) => (
        <Circle r={10} c={pos} key={key}>
          <Paint color="red" />
          <Paint color="white" style="stroke" strokeWidth={4} />
        </Circle>
      ))}
    </Canvas>
  );
};
