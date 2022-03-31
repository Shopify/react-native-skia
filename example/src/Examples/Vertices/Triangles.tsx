import type { SkiaReadonlyValue, Vector } from "@shopify/react-native-skia";
import { Path, useDerivedValue } from "@shopify/react-native-skia";
import React from "react";

const f = ({ x, y }: Vector) => [x, y].join(",");

interface TrianglesProps {
  vertices: SkiaReadonlyValue<Vector[]>;
}

export const Triangles = ({ vertices }: TrianglesProps) => {
  const path = useDerivedValue(() => {
    return vertices.current
      .map((a, i) => {
        const b = vertices.current[i + 1];
        const c = vertices.current[i + 4];
        if (c === undefined) {
          return "";
        }
        return `M${f(a)} L${f(b)} L${f(c)} Z`;
      })
      .join(" ");
  }, [vertices]);

  return <Path path={path} strokeWidth={3} color="black" style="stroke" />;
};
