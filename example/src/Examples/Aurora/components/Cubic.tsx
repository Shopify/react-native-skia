import React from "react";
import type { AnimationValue, Vector } from "@shopify/react-native-skia";
import { Line, Paint, Circle } from "@shopify/react-native-skia";

import { bilinearInterpolate } from "./Math";

interface CubicProps {
  vertices: AnimationValue<Vector[]>;
  index: number;
  c1: AnimationValue<Vector>;
  c2: AnimationValue<Vector>;
  c3: AnimationValue<Vector>;
  c4: AnimationValue<Vector>;
  colors: number[];
  size: Vector;
}

export const Cubic = ({
  vertices,
  index,
  c1,
  c2,
  c3,
  c4,
  colors,
  size,
}: CubicProps) => {
  return (
    <>
      <Line
        strokeWidth={2}
        color="white"
        p1={() => c1.value}
        p2={() => c3.value}
      />
      <Line
        strokeWidth={2}
        color="white"
        p1={() => c2.value}
        p2={() => c4.value}
      />
      <Circle
        c={() => vertices.value[index]}
        r={16}
        color={() => bilinearInterpolate(colors, size, vertices.value[index])}
      >
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      <Circle c={() => c1.value} r={10} color="white" />
      <Circle c={() => c2.value} r={10} color="white" />
      <Circle c={() => c3.value} r={10} color="white" />
      <Circle c={() => c4.value} r={10} color="white" />
    </>
  );
};
