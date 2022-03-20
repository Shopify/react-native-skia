import type SkiaReadonlyValue from "@shopify/react-native-skia";
import {
  DropShadow,
  FitBox,
  Group,
  InnerShadow,
  mix,
  Paint,
  rect,
  RoundedRect,
  rrect,
  useDerivedValue,
  vec,
} from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import React from "react";

import { Theme } from "./Theme";

interface ButtonProps {
  x: number;
  y: number;
  size: number;
  children?: ReactNode | ReactNode[];
  pressed: SkiaReadonlyValue<number>;
}

const container = rect(0, 0, 24, 24);

export const Button = ({ children, x, y, size, pressed }: ButtonProps) => {
  const c1 = useDerivedValue(
    () => `rgba(255, 255, 255, ${mix(pressed.current, 0, 0.7)})`,
    [pressed]
  );
  const c2 = useDerivedValue(
    () => `rgba(174, 174, 192, ${mix(pressed.current, 0, 0.42)})`,
    [pressed]
  );
  const transform = useDerivedValue(
    () => [
      { translateX: 7.5 },
      { translateY: 6 },
      { scale: mix(pressed.current, 1, 0.95) },
    ],
    [pressed]
  );
  return (
    <FitBox src={container} dst={rect(x, y, size, size)}>
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
        <RoundedRect rect={rrect(container, 5, 5)} color={Theme.white2} />
        <Paint>
          <InnerShadow dx={-1} dy={-1} blur={2} color={c1} />
          <InnerShadow dx={1.5} dy={1.5} blur={2} color={c2} />
        </Paint>
        <RoundedRect
          rect={rrect(rect(1, 1, 22, 22), 5, 5)}
          color={Theme.white1}
        />
      </Group>
      <Group transform={transform} origin={vec(12, 12)}>
        {children}
      </Group>
    </FitBox>
  );
};
