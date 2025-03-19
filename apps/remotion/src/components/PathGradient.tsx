import type { SkPath } from "@exodus/react-native-skia";
import { interpolate, Circle } from "@exodus/react-native-skia";
import { useMemo } from "react";
import { interpolateColors } from "remotion";

import { PathGeometry } from "./Geometry";
import { CLAMP } from "./animations";

const segLength = 1;

const segment = (path: SkPath) => {
  const geometry = new PathGeometry(path);
  const totalLength = geometry.getTotalLength();
  const segments = new Array(Math.ceil(totalLength / segLength))
    .fill(0)
    .map((_, i) => {
      return geometry.getPointAtLength(i * segLength);
    });
  return {
    segments,
    totalLength,
  };
};

interface PathGradientProps {
  path: SkPath;
  strokeWidth: number;
  progress: number;
  colors: string[];
  offset?: number;
}

export const PathGradient = ({
  path,
  strokeWidth,
  progress,
  colors,
  offset = 0,
}: PathGradientProps) => {
  const { segments, totalLength } = useMemo(() => segment(path), [path]);
  return (
    <>
      {segments.map((seg, key) => {
        const p = (key * segLength) / totalLength;
        const color = interpolateColors(
          p,
          colors.map((_, i) => i / (colors.length - 1)),
          colors
        );
        //const distanceToHead = Math.abs(p - progress);
        const r1 = strokeWidth / 2;
        const r2 = (strokeWidth * 0.75) / 2;
        const r = interpolate(
          p,
          [0, 0.25, 0.5, 0.75, 1],
          [r2, r1, r2, r1, r2],
          CLAMP
        );
        // const blur = interpolate(
        //   distanceToHead,
        //   [0, 0.15],
        //   [
        //     interpolate(
        //       progress,
        //       [0.95, 1],
        //       [10, 0],
        //       CLAMP
        //     ),
        //     0,
        //   ],
        //   CLAMP
        // );
        return (
          <Circle
            key={key}
            r={r}
            c={seg}
            color={color}
            opacity={p <= progress && p !== 0 && p >= offset ? 1 : 0}
          />
        );
      })}
    </>
  );
};
