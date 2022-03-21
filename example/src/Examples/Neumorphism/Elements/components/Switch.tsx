import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  mix,
  Circle,
  InnerShadow,
  RoundedRect,
  DropShadow,
  Group,
  Paint,
  rect,
  rrect,
  FitBox,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { Theme } from "./Theme";

const container = rect(0, 0, 48, 24);
// const aspectRatio = 0.5;
const rct1 = rrect(rect(1, 1, 46, 22), 12, 12);

interface SwitchProps {
  x: number;
  y: number;
  width: number;
  value: SkiaReadonlyValue<number>;
}

export const Switch = ({ x, y, width, value }: SwitchProps) => {
  const cx = useDerivedValue(() => mix(value.current, 12, 48 - 12), [value]);
  const r = useDerivedValue(() => mix(value.current, 0, 2), [value]);

  return (
    <FitBox src={container} dst={rect(x, y, width, width * 0.5)}>
      <Group>
        <Paint>
          <DropShadow dx={-1} dy={-1} blur={3} color="white" />
          <DropShadow
            dx={1.5}
            dy={1.5}
            blur={6}
            color="rgba(174, 174, 192, 0.4)"
          />
        </Paint>
        <RoundedRect rect={rrect(container, 12, 12)} color={Theme.white1} />
      </Group>
      <Group>
        <Paint>
          <InnerShadow
            dx={-1}
            dy={-1}
            blur={1}
            color="rgba(255, 255, 255, 0.7)"
          />
          <InnerShadow
            dx={1}
            dy={1}
            blur={2}
            color="rgba(174, 174, 192, 0.2)"
          />
        </Paint>
        <RoundedRect rect={rct1} color={Theme.white2} />
      </Group>
      <Group>
        <Paint>
          <DropShadow
            dx={2}
            dy={2}
            blur={3}
            color="rgba(174, 174, 192, 0.25)"
          />
          <DropShadow
            dx={0}
            dy={1}
            blur={4}
            color="rgba(174, 174, 192, 0.25)"
          />
        </Paint>
        <Circle cx={cx} cy={12} r={8} color={Theme.white1} />
        <Circle cx={cx} cy={12} r={r} color="#745FF2" opacity={value} />
      </Group>
    </FitBox>
  );
};
