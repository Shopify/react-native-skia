import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  Group,
  LinearGradient,
  translate,
  Circle,
  Paint,
  InnerShadow,
  Skia,
  DropShadow,
  vec,
  Path,
  SweepGradient,
  useFont,
  Text,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

const r1 = 60;
const r2 = 85;
const path = Skia.Path.Make();
path.addCircle(12 + r2, 12 + r2, r2);
const c = vec(12 + r2, 12 + r2);

interface ProgressBarProps {
  progress: SkiaReadonlyValue<number>;
}

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
      <Group>
        <Paint>
          <DropShadow dx={20} dy={20} color="#141415" blur={60} />
          <DropShadow dx={-20} dy={-20} color="#485057" blur={60} />
          <LinearGradient
            start={vec(12, 12)}
            end={vec(24 + 2 * r2, 24 + 2 * r2)}
            colors={["#101113", "#2B2F33"]}
          />
        </Paint>
        <Circle cx={12 + r2} cy={12 + r2} r={r2} />
      </Group>
      <Group>
        <Paint>
          <InnerShadow
            dx={2}
            dy={1}
            color="rgba(255, 255, 255, 0.5)"
            blur={2}
          />
          <InnerShadow
            dx={-25}
            dy={-25}
            color="rgba(59, 68, 81, 0.5)"
            blur={65}
          />
          <InnerShadow dx={25} dy={25} color="rgba(0, 0,0, 0.55)" blur={80} />
        </Paint>
        <Circle cx={37 + r1} cy={37 + r1} r={r1} color="#32363B" />
      </Group>
      <Group>
        <Paint>
          <SweepGradient
            c={vec(12 + r2, 12 + r2)}
            colors={["#2FB8FF", "#9EECD9"]}
          />
        </Paint>
        <Path
          path={path}
          style="stroke"
          strokeWidth={20}
          end={progress}
          strokeCap="round"
        />
        <Circle r={10} cx={12 + 2 * r2} cy={12 + r2} color="#2FB8FF" />
      </Group>
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
