import type { Vector } from "@shopify/react-native-skia";
import {
  useClockValue,
  useDerivedValue,
  Group,
  mix,
  vec,
  Points,
  Canvas,
  Vertices,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";
import SimplexNoise from "simplex-noise";

/// <reference path="cdt2d.d.ts" />
import cdt2d from "cdt2d";

const { width, height } = Dimensions.get("window");
const COLS = 6;
const ROWS = COLS * 2;
const size = width / (COLS - 1);
const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const points: Vector[] = [];
rows.forEach((i) => {
  cols.forEach((j) => {
    points.push(
      vec(
        j * size * mix(Math.random(), 0.5, 1),
        i * size * mix(Math.random(), 0.5, 1)
      )
    );
  });
});

const baseColors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];
const vertexColors = points.map((_, i) => baseColors[i % baseColors.length]);

const triangles = cdt2d(points.map(({ x, y }) => [x, y])).flat();
const defaultVertices = triangles.map((triangle) => points[triangle]);
const colors = triangles.map((triangle) => vertexColors[triangle]);
const noises = defaultVertices.map((_, i) => new SimplexNoise(`${i}`));
const A = 50;
const F = 5000;

export const Demo = () => {
  const clock = useClockValue();
  const vertices = useDerivedValue(() => {
    return defaultVertices.map(({ x, y }, i) =>
      vec(
        x + noises[i].noise2D(clock.current / F, 0) * A,
        y + noises[i].noise2D(0, clock.current / F) * A
      )
    );
  }, [clock]);
  return (
    <Canvas style={{ width, height }}>
      <Group transform={[{ scale: 1.5 }]}>
        <Vertices vertices={vertices} colors={colors} />
        <Points points={points} color="black" style="stroke" strokeWidth={4} />
      </Group>
    </Canvas>
  );
};
