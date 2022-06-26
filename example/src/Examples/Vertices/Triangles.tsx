import type { SkiaValue, Vector } from "@shopify/react-native-skia";
import { Path, useComputedValue } from "@shopify/react-native-skia";
import React from "react";

const f = ({ x, y }: Vector) => [x, y].join(",");

interface TrianglesProps {
  vertices: SkiaValue<Vector[]>;
  triangles: [number, number, number][];
}

export const Triangles = ({ vertices, triangles }: TrianglesProps) => {
  const path = useComputedValue(() => {
    return triangles
      .map(([a, b, c]) => {
        const v1 = vertices.current[a];
        const v2 = vertices.current[b];
        const v3 = vertices.current[c];
        return `M${f(v1)} L${f(v2)} L${f(v3)} Z`;
      })
      .join("");
  }, [vertices]);

  return <Path path={path} strokeWidth={1} color="white" style="stroke" />;
};
