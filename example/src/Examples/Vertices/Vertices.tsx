import "./cdt2d.d";
import type { Vector } from "@shopify/react-native-skia";
import {
  Circle,
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
import cdt2d from "cdt2d";

const { width, height } = Dimensions.get("window");
const COLS = 6;
const ROWS = COLS * 2;
const size = width / (COLS - 1);
const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const defaultPoints: Vector[] = [];
rows.forEach((i) => {
  cols.forEach((j) => {
    defaultPoints.push(vec(j * size, i * size));
  });
});

const baseColors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];

const A = 40;
const F = 10000;

export const Demo = () => {
  const clock = useClockValue();
  const points = useDerivedValue(() => {
    return defaultPoints.map(({ x, y }, i) => {
      const noise = new SimplexNoise(`${i}`);
      return vec(
        x + noise.noise2D(clock.current / F, 0) * A,
        y + noise.noise2D(0, clock.current / F) * A
      );
    });
  }, [clock]);
  const vertices = useDerivedValue(() => {
    const t = cdt2d(points.current.map(({ x, y }) => [x, y])).flat();
    const d = t.map((triangle) => points.current[triangle]);
    return d;
  }, [clock]);
  const colors = useDerivedValue(
    () =>
      vertices.current.map(({ x, y }) => {
        const i = points.current.findIndex((v) => v.x === x && v.y === y);
        return baseColors[i % baseColors.length];
      }),
    [clock]
  );
  return (
    <Canvas style={{ width, height }}>
      <Group transform={[{ scale: 1 }]}>
        <Vertices vertices={vertices} colors={colors} />
        <Points points={points} color="black" style="stroke" strokeWidth={4} />
        {defaultPoints.map((_, i) => {
          const c = useDerivedValue(() => points.current[i], [clock]);
          const color = useDerivedValue(() => {
            const { x, y } = vertices.current[i];
            const j = points.current.findIndex((v) => v.x === x && v.y === y);
            return baseColors[j % baseColors.length];
          }, [clock]);
          return (
            <React.Fragment key={i}>
              <Circle c={c} color={"white"} r={6} />
              <Circle c={c} color={color} r={4} />
            </React.Fragment>
          );
        })}
      </Group>
    </Canvas>
  );
};
