import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  rect,
  rrect,
  Group,
  LinearGradient,
  translate,
  Circle,
  Paint,
  Skia,
  vec,
  Path,
  SweepGradient,
  useFont,
  Text,
  useDerivedValue,
  Box,
} from "@shopify/react-native-skia";
import React from "react";

const r1 = 60;
const r2 = 85;
const path = Skia.Path.Make();
path.addCircle(12 + r2, 12 + r2, r2);
const c = vec(12 + r2, 12 + r2);

const fromCircle = (cx: number, cy: number, r: number) =>
  rrect(rect(cx - r, cy - r, 2 * r, 2 * r), r, r);

interface ProgressBarProps {
  progress: SkiaReadonlyValue<number>;
}

const colors = ["#2FB8FF", "#9EECD9"];

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  const font = useFont(require("./SF-Mono-Semibold.otf"), 32);
  const text = useDerivedValue(
    () => `${Math.round(progress.current * 100)}°C`,
    [progress]
  );
  if (font === null) {
    return null;
  }
  const pos = font.measureText("00°C");
  return (
    <Group transform={translate({ x: 100, y: 223 })}>
      <Text
        x={c.x - pos.width / 2}
        y={c.y + pos.height / 2}
        font={font}
        text={text}
        color="white"
      />
    </Group>
  );
};
