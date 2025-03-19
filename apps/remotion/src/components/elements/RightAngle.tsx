import type { SkPoint } from "@exodus/react-native-skia";
import { rotate } from "@exodus/react-native-skia";

import { getPointAtLength } from "../math";
import type { Gradients } from "../Theme";

import { Arrow } from "./Arrow";

interface RightAngleProps {
  p1: SkPoint;
  p2: SkPoint;
  p3: SkPoint;
  color?: keyof typeof Gradients;
  progress?: number;
}

export const RightAngle = ({
  p1,
  p2,
  p3,
  progress = 1,
  color = "primary",
}: RightAngleProps) => {
  const p1Style = "none";
  const p2Style = "none";
  const size = 75;
  const a1 = getPointAtLength(size, p3, p1);
  const a2 = rotate(p3, a1, Math.PI / 2);
  const a3 = getPointAtLength(size, p3, p2);
  return (
    <>
      <Arrow
        p1={a1}
        p2={a2}
        progress={progress}
        color={color}
        p1Style={p1Style}
        p2Style={p2Style}
      />
      <Arrow
        p1={a3}
        p2={a2}
        progress={progress}
        color={color}
        p1Style={p1Style}
        p2Style={p2Style}
      />
    </>
  );
};
