import React from "react";
import type { AnimationValue, Vector } from "@shopify/react-native-skia";
import { Paint, Circle } from "@shopify/react-native-skia";

interface CubicProps {
  vertices: AnimationValue<Vector[]>;
  index: number;
}

export const Cubic = ({ vertices, index }: CubicProps) => {
  return (
    <>
      {/* <Line
        strokeWidth={2}
        color="white"
        p1={() => cubic.value.pos}
        p2={() => cubic.value.c1}
      />
      <Line
        strokeWidth={2}
        color="white"
        p1={() => cubic.value.pos}
        p2={() => cubic.value.c2}
      /> */}
      <Circle c={() => vertices.value[index]} r={16} color="black">
        <Paint style="stroke" strokeWidth={4} color="white" />
      </Circle>
      {/* <Circle c={() => cubic.value.c1} r={10} color="white" />
      <Circle c={() => cubic.value.c2} r={10} color="white" /> */}
    </>
  );
};
