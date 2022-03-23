import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  mix,
  Circle,
  Shadow,
  Group,
  Paint,
  rect,
  rrect,
  FitBox,
  useDerivedValue,
  Box,
} from "@shopify/react-native-skia";
import React from "react";

import { Theme } from "./Theme";

const container = rect(0, 0, 48, 24);
// const aspectRatio = 0.5;
const rct1 = rrect(rect(1, 1, 46, 22), 12, 12);

const fromCircle = (cx: number, cy: number, r: number) =>
  rrect(rect(cx - r, cy - r, 2 * r, 2 * r), r, r);

interface SwitchProps {
  x: number;
  y: number;
  width: number;
  value: SkiaReadonlyValue<number>;
}

export const Switch = ({ x, y, width, value }: SwitchProps) => {
  const cx = useDerivedValue(() => mix(value.current, 12, 48 - 12), [value]);
  const r = useDerivedValue(() => mix(value.current, 0, 2), [value]);
  const box = useDerivedValue(() => fromCircle(cx.current, 12, 8), [value]);
  return (
    <FitBox src={container} dst={rect(x, y, width, width * 0.5)}>
      <Box
        box={rrect(container, 12, 12)}
        color={Theme.white1}
        shadows={[
          { dx: -1, dy: -1, blur: 3, color: Theme.white1 },
          { dx: 1.5, dy: 1.5, blur: 6, color: "rgba(174, 174, 192, 0.4)" },
        ]}
      />
      <Box
        box={rct1}
        color={Theme.white2}
        shadows={[
          {
            dx: -1,
            dy: -1,
            blur: 1,
            color: "rgba(255, 255, 255, 0.7)",
            inner: true,
          },
          {
            dx: 1,
            dy: 1,
            blur: 2,
            color: "rgba(174, 174, 192, 0.2)",
            inner: true,
          },
        ]}
      />
      <Box
        box={box}
        shadows={[
          { dx: 2, dy: 2, blur: 3, color: "rgba(174, 174, 192, 0.25)" },
          { dx: 0, dy: 1, blur: 4, color: "rgba(174, 174, 192, 0.25)" },
        ]}
        color={Theme.white1}
      />
      <Circle cx={cx} cy={12} r={r} color="#745FF2" opacity={value} />
    </FitBox>
  );
};
