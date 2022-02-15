import React from "react";
import type { Value, CubicBezierHandle } from "@shopify/react-native-skia";
import { Line, Paint, Circle } from "@shopify/react-native-skia";

import { symmetric } from "./Math";

interface CubicProps {
  mesh: Value<CubicBezierHandle[]>;
  index: number;
  color: string;
}

export const Cubic = ({ mesh, index, color }: CubicProps) => {
  return (
    <>
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.value[index].c1}
        p2={() => symmetric(mesh.value[index].c1, mesh.value[index].pos)}
      />
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.value[index].c2}
        p2={() => symmetric(mesh.value[index].c2, mesh.value[index].pos)}
      />
      <Circle c={() => mesh.value[index].pos} r={16} color={() => color}>
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      <Circle c={() => mesh.value[index].c1} r={10} color="white" />
      <Circle c={() => mesh.value[index].c2} r={10} color="white" />
      <Circle
        c={() => symmetric(mesh.value[index].c1, mesh.value[index].pos)}
        r={10}
        color="white"
      />
      <Circle
        c={() => symmetric(mesh.value[index].c2, mesh.value[index].pos)}
        r={10}
        color="white"
      />
    </>
  );
};
