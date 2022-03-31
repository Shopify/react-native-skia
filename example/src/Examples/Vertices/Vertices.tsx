import {
  Canvas,
  Fill,
  Points,
  useClockValue,
  vec,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";
import "./cdt2d.d";
import cdt2d from "cdt2d";
import SimplexNoise from "simplex-noise";

import { Triangles } from "./Triangles";

const { width, height } = Dimensions.get("window");
const N = 3;
const n = new Array(N + 1).fill(0).map((_, i) => i);
const hSize = width / N;
const vSize = height / N;

const defaultVertices = n
  .map((col) => n.map((row) => vec(col * hSize, row * vSize)))
  .flat();

//const defaultTriangles = cdt2d(defaultVertices.map(({ x, y }) => [x, y]));
//console.log({ created: triangles.length });

const A = 0.4 * hSize;
const F = 5000;

export const Demo = () => {
  const clock = useClockValue();
  const vertices = useDerivedValue(
    () =>
      defaultVertices.map(({ x, y }) => {
        const isEdge = x === 0 || y === 0 || x === width || y === height;
        if (isEdge) {
          return vec(x, y);
        }
        const noise = new SimplexNoise(`${x}-${y}`);
        return vec(
          x + noise.noise2D(clock.current / F, 0) * A,
          y + noise.noise2D(0, clock.current / F) * A
        );
      }),
    // .map(({ x, y }, i) => {
    //     const isEdge = x === 0 || y === 0 || x === width || y === height;
    //     if (isEdge) {
    //       return vec(x, y);
    //     }
    //     const noise = new SimplexNoise(i);
    //     return vec(
    //       x + noise.noise2D(clock.current / F, 0) * A,
    //       y + noise.noise2D(0, clock.current / F)
    //     );
    //   }),
    [clock]
  );
  return (
    <Canvas style={{ width, height }}>
      <Fill color="white" />
      <Triangles vertices={vertices} />
      <Points points={vertices} style="stroke" strokeWidth={8} color="red" />
    </Canvas>
  );
};
