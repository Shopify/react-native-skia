import React from "react";
import { Group, Line, RoundedRect, vec } from "@shopify/react-native-skia";

export const CreditCard = () => {
  return (
    <Group style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round">
      <RoundedRect x={1} y={4} width={22} height={16} r={2} />
      <Line p1={vec(1, 10)} p2={vec(23, 10)} />
    </Group>
  );
};
