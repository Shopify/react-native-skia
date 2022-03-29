import {
  Group,
  LinearGradient,
  Paint,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import React from "react";

//interface CardProps {}

const x = 16;
const y = 126;
const width = 342;
const height = 200;
const start = vec(x, height);
const end = vec(x + width, 0);
const colors = ["#413DFF", "#547AFF"];

export const Card = () => {
  return (
    <Group>
      <Paint>
        <LinearGradient start={start} end={end} colors={colors} />
      </Paint>
      <RoundedRect x={x} y={y} width={width} height={height} r={16} />
    </Group>
  );
};
