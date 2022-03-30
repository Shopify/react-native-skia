/* eslint-disable max-len */
import {
  Circle,
  Group,
  Paint,
  Path,
  rect,
  RoundedRect,
  vec,
} from "@shopify/react-native-skia";
import React from "react";
import { LinearGradient } from "@shopify/react-native-skia";

import { CANVAS } from "./Canvas";

const { width } = CANVAS;

export const Graph = () => {
  return (
    <Group y={126} x={8} clip={rect(0, 0, width - 16, 200)}>
      <RoundedRect
        color="white"
        x={0}
        y={0}
        width={width - 16}
        height={200}
        r={24}
      />
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, 200)}
            colors={["#2F80ED33", "#2F80ED00"]}
          />
        </Paint>
        <Path path="M49.7146 64.233C24.5 64.233 2 83.7051 2 83.7051V199.999H362V39.4699C362 39.4699 350.3 25.7829 331.798 21.3505C298.45 13.3615 293.796 71.685 264.5 71.6851C242.982 71.6851 241.495 35.242 212.804 31.9201C184.112 28.5983 171.17 112.287 124.917 111.343C90.2681 110.636 69.2 64.233 49.7146 64.233Z" />
      </Group>
      <Path
        path="M2.6001 83.4554C2.6001 83.4554 24.5001 64.1603 49.7147 64.1603C70.7001 64.1603 90.2682 110.486 124.917 111.192C171.17 112.134 184.112 28.585 212.804 31.9013C241.495 35.2176 242.982 71.6 264.5 71.6C293.796 71.5999 298.45 13.3736 331.798 21.3493C350.3 25.7742 362 39.4384 362 39.4384"
        color="#2F80ED"
        style="stroke"
        strokeCap="round"
        strokeWidth={5}
      />
      <Path
        path="M208 20C208 8.95431 216.954 0 228 0H236C247.046 0 256 8.95431 256 20V200H208V20Z"
        color="#2F80ED"
        opacity={0.2}
      />
      <Circle cx={232.4} cy={40.4} r={15} color="white" />
      <Circle cx={232.4} cy={40.4} r={10} color="#2F80ED" />
    </Group>
  );
};
