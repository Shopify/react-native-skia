import type { SkPoint } from "@shopify/react-native-skia";
import {
  vec,
  Skia,
  Group,
  Text,
  LinearGradient,
} from "@shopify/react-native-skia";
import { useMemo } from "react";

import { Gradients } from "../Theme";
import { useTypefaces } from "../Canvas";

import { PathCircle } from "./Shapes";

const r = 40;
const fontSize = 100;

interface PointProps {
  c: SkPoint;
  color?: keyof typeof Gradients;
  label?: string;
  progress?: number;
  labelOnly?: boolean;
  anchorH?: "left" | "right";
}

export const Point = ({
  c,
  color = "primary",
  label,
  progress = 1,
  labelOnly = false,
  anchorH = "right",
}: PointProps) => {
  const { RubikMedium } = useTypefaces();
  const font = useMemo(() => {
    return Skia.Font(RubikMedium, fontSize);
  }, [RubikMedium]);
  const textWidth = font.getTextWidth(label ?? "");
  const x = anchorH === "right" ? c.x + r + 10 : c.x - r - textWidth - 10;
  const { y } = c;
  return (
    <Group opacity={progress}>
      {!labelOnly && <PathCircle c={c} r={r} color={color} fill />}
      {label && (
        <Text text={label} x={x} y={c.y + fontSize} font={font}>
          <LinearGradient
            start={vec(x, y)}
            end={vec(x + textWidth, y + fontSize)}
            colors={Gradients[color]}
          />
        </Text>
      )}
    </Group>
  );
};
