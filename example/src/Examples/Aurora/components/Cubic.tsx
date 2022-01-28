import React from "react";
import type { AnimationValue, CubicBezier } from "@shopify/react-native-skia";
import { Paint, Circle } from "@shopify/react-native-skia";

export type Mesh = CubicBezier[][];

interface CubicProps {
  row: number;
  col: number;
  mesh: AnimationValue<Mesh>;
  color: number;
}

export const Cubic = ({ row, col, mesh, color }: CubicProps) => {
  const { src, c1, c2 } = mesh.value[row][col];
  return (
    <>
      <Circle c={src} r={16} color={color}>
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
    </>
  );
};
