import {
  BackdropBlur,
  Fill,
  rect,
  Group,
  vec,
  useDerivedValue,
  mixColors,
  Skia,
  LinearGradient,
  Paint,
} from "@shopify/react-native-skia";
import React from "react";

import type { ModeProps } from "./Canvas";
import { CANVAS, useGradientsColors } from "./Canvas";
import { Activity } from "./icons/Activity";
import { CreditCard } from "./icons/CreditCard";
import { Home } from "./icons/Home";
import { PieChart } from "./icons/PieChart";

const y = CANVAS.height - 100;
const w = 375 - 16;
const size = w / 4;
const scale = 1.25;
const x = (size - scale * 24) / 2;

export const Tabbar = ({ mode }: ModeProps) => {
  const colors = useGradientsColors(mode, ["#1E1E20", "#1E1E20", "#1E1E20"]);
  const color = useDerivedValue(
    () =>
      mixColors(
        mode.current,
        Skia.Color("rgba(252, 252, 252, 0.64)"),
        Skia.Color("rgba(0, 0, 0, 0.3)")
      ),
    [mode]
  );
  return (
    <BackdropBlur blur={20} clip={rect(0, y, 375, 100)}>
      <Fill color={color} />
      <Group color="#acacaf" y={y}>
        <Group transform={[{ scale }]} origin={vec(12, 12)} x={x} y={24}>
          <Home />
        </Group>
        <Group transform={[{ scale }]} origin={vec(12, 12)} x={size + x} y={24}>
          <PieChart />
        </Group>
        <Group
          transform={[{ scale }]}
          origin={vec(12, 12)}
          x={2 * size + x}
          y={24}
        >
          {/* <Group>
            <Paint>
              <RadialGradient
                c={vec(12, 12)}
                r={24}
                colors={["white", "transparent"]}
              />
              <Blur blur={4} />
            </Paint>
            <Rect x={0} y={0} width={24} height={24} />
          </Group> */}
          <Paint>
            <LinearGradient
              colors={colors}
              start={vec(0, 24)}
              end={vec(24, 0)}
            />
          </Paint>
          <Activity />
        </Group>
        <Group
          transform={[{ scale }]}
          origin={vec(12, 12)}
          x={3 * size + x}
          y={24}
        >
          <CreditCard />
        </Group>
      </Group>
    </BackdropBlur>
  );
};
