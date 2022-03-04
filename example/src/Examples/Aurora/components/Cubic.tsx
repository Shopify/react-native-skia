import React from "react";
import type { SkiaValue, CubicBezierHandle } from "@shopify/react-native-skia";
import { Line, Paint, Circle } from "@shopify/react-native-skia";

import { symmetric } from "./Math";

interface CubicProps {
  mesh: SkiaValue<CubicBezierHandle[]>;
  index: number;
  color: string;
}

export const Cubic = ({ mesh, index, color }: CubicProps) => {
  return (
    <>
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.current[index].c1}
        p2={() => symmetric(mesh.current[index].c1, mesh.current[index].pos)}
      />
      <Line
        strokeWidth={2}
        color="white"
        p1={() => mesh.current[index].c2}
        p2={() => symmetric(mesh.current[index].c2, mesh.current[index].pos)}
      />
      <Circle c={() => mesh.current[index].pos} r={16} color={() => color}>
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      <Circle c={() => mesh.current[index].c1} r={10} color="white" />
      <Circle c={() => mesh.current[index].c2} r={10} color="white" />
      <Circle
        c={() => symmetric(mesh.current[index].c1, mesh.current[index].pos)}
        r={10}
        color="white"
      />
      <Circle
        c={() => symmetric(mesh.current[index].c2, mesh.current[index].pos)}
        r={10}
        color="white"
      />
    </>
  );
};
