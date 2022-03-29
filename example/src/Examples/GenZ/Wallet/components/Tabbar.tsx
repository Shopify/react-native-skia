import {
  BackdropBlur,
  Fill,
  rect,
  Group,
  vec,
} from "@shopify/react-native-skia";
import React from "react";

import { CANVAS } from "./Canvas";
import { Activity } from "./icons/Activity";
import { CreditCard } from "./icons/CreditCard";
import { Home } from "./icons/Home";
import { PieChart } from "./icons/PieChart";

const y = CANVAS.height - 100;
const w = 375 - 16;
const size = w / 4;
const scale = 1.25;
const x = (size - scale * 24) / 2;

export const Tabbar = () => {
  return (
    <BackdropBlur blur={20} clip={rect(0, y, 375, 100)}>
      <Fill color="rgba(252, 252, 252, 0.64)" />
      <Group color="rgba(172, 172, 176, 0.8)" y={y}>
        <Group
          color="#1E1E20"
          transform={[{ scale }]}
          origin={vec(12, 12)}
          x={x}
          y={24}
        >
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
