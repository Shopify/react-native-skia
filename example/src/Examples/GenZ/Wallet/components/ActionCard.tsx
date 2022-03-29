import React from "react";
import {
  Group,
  Paint,
  RoundedRect,
  LinearGradient,
  vec,
} from "@shopify/react-native-skia";

interface ActionCardProps {
  y: number;
}

export const ActionCard = ({ y }: ActionCardProps) => {
  return (
    <Group y={y}>
      <Paint>
        <LinearGradient
          start={vec(8, 72)}
          end={vec(8 + 343, 0)}
          colors={["#547AFF", "#413DFF"]}
        />
      </Paint>
      <RoundedRect x={8} y={0} width={343} height={73} r={12} />
    </Group>
  );
};
