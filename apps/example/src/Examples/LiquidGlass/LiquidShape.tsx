import { Canvas, Fill, Group, rect } from "@shopify/react-native-skia";
import React, { useState } from "react";

export const LiquidShape = () => {
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  return (
    <Canvas
      style={{ flex: 1 }}
      onLayout={({ nativeEvent: { layout } }) => {
        setSize({
          width: layout.width,
          height: layout.height,
        });
      }}
    >
      <Group clip={rect(0, height / 2, width, height / 2)}>
        <Fill color="black" />
      </Group>
    </Canvas>
  );
};
