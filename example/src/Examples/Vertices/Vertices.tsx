import {
  Canvas,
  Fill,
  Points,
  useClockValue,
  vec,
  useDerivedValue,
  Vertices,
  Group,
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
const baseColors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];

const defaultVertices = n
  .map((col) => n.map((row) => vec(col * hSize, row * vSize)))
  .flat();

const triangles = cdt2d(defaultVertices.map(({ x, y }) => [x, y]));
const denormalizedColors = triangles
  .map(([a, b, c]) => {
    const v1 = baseColors[a % baseColors.length];
    const v2 = baseColors[b % baseColors.length];
    const v3 = baseColors[c % baseColors.length];
    return [v1, v2, v3];
  })
  .flat();
const A = hSize * 1;
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
    [clock]
  );
  const denormalizedVertices = useDerivedValue(() => {
    return triangles
      .map(([a, b, c]) => {
        const v1 = vertices.current[a];
        const v2 = vertices.current[b];
        const v3 = vertices.current[c];
        return [v1, v2, v3];
      })
      .flat();
  }, [vertices]);
  return (
    <Canvas style={{ width, height }}>
      <Fill color="white" />
      <Group transform={[{ scale: 1 }]} origin={vec(width / 2, height / 2)}>
        <Vertices
          vertices={denormalizedVertices}
          colors={denormalizedColors}
          // textures={defaultDenormalizedVertices}
        />
      </Group>
      <Triangles vertices={vertices} triangles={triangles} />
      <Points points={vertices} style="stroke" strokeWidth={8} color="red" />
    </Canvas>
  );
};
