import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
  Canvas,
  useClockValue,
  vec,
  useComputedValue,
  Vertices,
  useImage,
  Skia,
  isEdge,
} from "@shopify/react-native-skia";
import cdt2d from "cdt2d";
import SimplexNoise from "simplex-noise";

import "./cdt2d.d";

const N = 3;
const n = new Array(N + 1).fill(0).map((_, i) => i);

const F = 6000;
const palette = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf"];

export const Demo = () => {
  const { width, height } = useWindowDimensions();

  const window = useMemo(
    () => Skia.XYWHRect(0, 0, width, height),
    [height, width]
  );

  const hSize = width / N;
  const vSize = height / N;
  const AX = hSize * 0.45;
  const AY = vSize * 0.45;

  const defaultVertices = useMemo(() => {
    return n.map((col) => n.map((row) => vec(col * hSize, row * vSize))).flat();
  }, [hSize, vSize]);

  const triangles = useMemo(
    () => cdt2d(defaultVertices.map(({ x, y }) => [x, y])),
    [defaultVertices]
  );

  const indices = useMemo(() => triangles.flat(), [triangles]);
  const colors = useMemo(
    () => indices.map((i) => palette[i % palette.length]),
    [indices]
  );

  const oslo = useImage(require("../../assets/oslo.jpg"));
  const clock = useClockValue();

  const vertices = useComputedValue(
    () =>
      defaultVertices.map((vertex, i) => {
        if (isEdge(vertex, window)) {
          return vertex;
        }
        const noise = new SimplexNoise(i);
        return {
          x: vertex.x + AX * noise.noise2D(clock.current / F, 0),
          y: vertex.y + AY * noise.noise2D(0, clock.current / F),
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
