import React from "react";
import type { AnimationValue, CubicBezier } from "@shopify/react-native-skia";
import { Line, Paint, Circle } from "@shopify/react-native-skia";

export type Mesh = CubicBezier[][];

interface CubicProps {
  row: number;
  col: number;
  mesh: AnimationValue<Mesh>;
  color: number;
}

export const Cubic = ({ row, col, mesh, color }: CubicProps) => {
  return (
    <>
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.value[row][col].src}
        p2={() => mesh.value[row][col].c1}
      />
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.value[row][col].src}
        p2={() => mesh.value[row][col].c2}
      />
      <Circle c={() => mesh.value[row][col].src} r={16} color={color}>
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      <Circle c={() => mesh.value[row][col].c1} r={10} color="white" />
      <Circle c={() => mesh.value[row][col].c2} r={10} color="white" />
    </>
  );
};
