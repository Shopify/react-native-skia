import {
  BackdropFilter,
  Canvas,
  DisplacementMap,
  Fill,
  Group,
  rect,
  Shader,
  Skia,
} from "@shopify/react-native-skia";
import React, { useState } from "react";
import {
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";

const source = Skia.RuntimeEffect.Make(`
uniform float2 size;
uniform float time;

half4 main(float2 xy) {
  float2 uv = xy / size;
  
  // Create a wave pattern for displacement
  float wave1 = sin(uv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
  float wave2 = cos(uv.y * 8.0 + time * 1.5) * 0.5 + 0.5;
  
  // Combine waves for more complex displacement
  float displacement = wave1 * wave2;
  
  // Use red channel for X displacement, blue channel for Y displacement
  return vec4(displacement, 0.0, displacement * 0.7, 1.0);
}
`)!;

export const LiquidShape = () => {
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  const time = useSharedValue(0);

  useFrameCallback(() => {
    time.value += 0.016; // ~60fps
  });

  const uniforms = useDerivedValue(() => {
    return {
      size: [width, height],
      time: time.value,
    };
  });

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
      <BackdropFilter
        filter={
          <DisplacementMap channelX="a" channelY="r" scale={40}>
            <Shader source={source} uniforms={uniforms} />
          </DisplacementMap>
        }
      />
    </Canvas>
  );
};
