import React from "react";
import { Group, rrect, rect } from "@shopify/react-native-skia";
import type { SkiaReadonlyValue } from "@shopify/react-native-skia";

import { BaseCard } from "./BaseCard";

interface ActionCardProps {
  y: number;
  mode: SkiaReadonlyValue<number>;
}

export const ActionCard = ({ y, mode }: ActionCardProps) => {
  return (
    <Group y={y}>
      <BaseCard y={0} mode={mode} rect={rrect(rect(16, 0, 343, 73), 12, 12)} />
    </Group>
  );
};
