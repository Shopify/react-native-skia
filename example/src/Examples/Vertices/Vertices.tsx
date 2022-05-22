import React from "react";
import { Dimensions } from "react-native";
import {
  Canvas,
  useClockValue,
  vec,
  useDerivedValue,
  Vertices,
  useImage,
} from "@shopify/react-native-skia";
import cdt2d from "cdt2d";
import SimplexNoise from "simplex-noise";

import "./cdt2d.d";

const dim = Dimensions.get("window");
const width = Math.fround(dim.width);
const height = Math.fround(dim.height);
const N = 3;
const n = new Array(N + 1).fill(0).map((_, i) => i);
const hSize = width / N;
const vSize = height / N;
const AX = hSize * 0.45;
const AY = vSize * 0.45;
const F = 6000;
const palette = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];
const defaultVertices = n
  .map((col) => n.map((row) => vec(col * hSize, row * vSize)))
  .flat();
const triangles = cdt2d(defaultVertices.map(({ x, y }) => [x, y]));
const indices = triangles.flat();
const colors = indices.map((i) => palette[i % palette.length]);

export const Demo = () => {
  const oslo = useImage(require("../../assets/oslo.jpg"));
  const clock = useClockValue();
  const vertices = useDerivedValue(
    () =>
      defaultVertices.map(({ x, y }, i) => {
        const isEdge = x === 0 || y === 0 || x === width || y === height;
        if (isEdge) {
          return { x, y };
        }
        const noise = new SimplexNoise(i);
        return {
          x: x + AX * noise.noise2D(clock.current / F, 0),
          y: y + AY * noise.noise2D(0, clock.current / F),
        };
      }),
    [clock]
  );
  if (!oslo) {
    return null;
  }
  return (
    <Canvas style={{ width, height }}>
      <Vertices
        vertices={vertices}
        indices={indices}
        textures={defaultVertices}
        colors={colors}
      />
      {/* <Points points={vertices} style="stroke" color="white" strokeWidth={1} />
      <Triangles vertices={vertices} triangles={triangles} /> */}
    </Canvas>
  );
};
