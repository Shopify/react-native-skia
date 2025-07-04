import {
  BackdropFilter,
  Canvas,
  Fill,
  Group,
  rect,
  RuntimeShader,
  Skia,
} from "@shopify/react-native-skia";
import React, { useState } from "react";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {
  return image.eval(xy) + vec4(0.5, 0.1, 0.9, 0.0);
}
`)!;

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
      <BackdropFilter filter={<RuntimeShader source={source} />} />
    </Canvas>
  );
};
