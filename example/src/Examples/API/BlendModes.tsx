import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const r = width / 4;

export const BlendModes = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={2 * r} cy={r} r={r} color="cyan" />
        <Circle cx={1.5 * r} cy={2 * r} r={r} color="magenta" />
        <Circle cx={2.5 * r} cy={2 * r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};
