import type { Vector } from "@exodus/react-native-skia";
import {
  vec,
  LinearGradient,
  Circle,
  dist,
  rotate,
  mix,
  DashPathEffect,
  Line,
  mixVector,
} from "@exodus/react-native-skia";
import { interpolate } from "remotion";

import { Gradients } from "../Theme";
import { EASE_CLAMP } from "../animations";
import { getPointAtLength } from "../math";

type ArrowStyle = "none" | "arrow" | "circle";

interface ArrowProps {
  p1: Vector;
  p2: Vector;
  progress?: number;
  color?: keyof typeof Gradients;
  dashed?: boolean;
  p1Style?: ArrowStyle;
  p2Style?: ArrowStyle;
  strokeWidth?: number;
  padding?: number;
}

export const Arrow = ({
  p1: rawP1,
  p2: rawP2,
  padding,
  progress = 1,
  color: colorName = "tertiary",
  dashed = false,
  p1Style = "arrow",
  p2Style = "arrow",
  strokeWidth = 20,
}: ArrowProps) => {
  const p1 = padding ? getPointAtLength(padding, rawP1, rawP2) : rawP1;
  const p2 = padding
    ? getPointAtLength(dist(rawP1, rawP2) - padding, rawP1, rawP2)
    : rawP2;
  const progress1 = interpolate(progress, [0, 0.9], [0, 1], EASE_CLAMP);
  const progress2 = interpolate(progress, [0.9, 1], [0, 1], EASE_CLAMP);
  const p3 = mixVector(progress1, p1, p2);
  const theta = mix(progress2, 0, Math.PI / 4);

  const length = dist(p1, p2);
  const start = getPointAtLength(length - strokeWidth * 2, p1, p2);
  const a1 = rotate(start, p2, theta);
  const a2 = rotate(start, p2, -theta);

  const start2 = getPointAtLength(strokeWidth * 2, p1, p2);
  const a3 = rotate(start2, p1, theta);
  const a4 = rotate(start2, p1, -theta);
  const colors = Gradients[colorName];
  return (
    <>
      {progress1 > 0 && (
        <Line
          p1={p1}
          p2={p3}
          style="stroke"
          strokeWidth={strokeWidth}
          strokeCap="round"
          strokeJoin="round"
        >
          {dashed && (
            <DashPathEffect intervals={[strokeWidth * 2, strokeWidth * 2]} />
          )}
          <LinearGradient start={p1} end={p2} colors={colors} />
        </Line>
      )}
      {p2Style === "arrow" && progress2 > 0 && (
        <>
          <Line
            p1={a1}
            p2={p2}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <LinearGradient start={a1} end={p2} colors={colors} />
          </Line>
          <Line
            p1={a2}
            p2={p2}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <LinearGradient start={a2} end={p2} colors={colors} />
          </Line>
        </>
      )}
      {p1Style === "arrow" && progress2 > 0 && (
        <>
          <Line
            p1={a3}
            p2={p1}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <LinearGradient start={a3} end={p1} colors={colors} />
          </Line>
          <Line
            p1={a4}
            p2={p1}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          >
            <LinearGradient start={a4} end={p1} colors={colors} />
          </Line>
        </>
      )}
      {p2Style === "circle" && (
        <Circle c={p2} r={strokeWidth * 2} opacity={progress2}>
          <LinearGradient
            start={vec(p2.x - strokeWidth * 2, p2.y - strokeWidth * 2)}
            end={vec(p2.x + strokeWidth * 2, p2.y + strokeWidth * 2)}
            colors={colors}
          />
        </Circle>
      )}
      {p1Style === "circle" && (
        <Circle c={p1} r={strokeWidth * 2} opacity={progress1}>
          <LinearGradient
            start={vec(p1.x - strokeWidth * 2, p1.y - strokeWidth * 2)}
            end={vec(p1.x + strokeWidth * 2, p1.y + strokeWidth * 2)}
            colors={colors}
          />
        </Circle>
      )}
    </>
  );
};
