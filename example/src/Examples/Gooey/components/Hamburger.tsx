import {
  IPath,
  useFrame,
  Group,
  Path,
  Circle,
  vec,
  Line,
} from "@shopify/react-native-skia";
import React from "react";

const R = 50;

export const Hamburger = () => {
  const p2 = useFrame((ctx) => {
    console.log(ctx.getTouches());
    return vec(20, -15);
  });
  return (
    <>
      <Circle c={vec()} r={R} color="#ade6e6" />
      <Line
        p1={vec(-20, -15)}
        p2={p2}
        color="white"
        style="stroke"
        strokeWidth={6}
      />
      <Line
        p1={vec(-20, 0)}
        p2={vec(20, 0)}
        color="white"
        style="stroke"
        strokeWidth={6}
      />
      <Line
        p1={vec(-20, 15)}
        p2={vec(20, 15)}
        color="white"
        style="stroke"
        strokeWidth={6}
      />
    </>
  );
};
