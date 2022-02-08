import React from "react";
import { Dimensions } from "react-native";
import {
  Canvas,
  Paint,
  Rect,
  ImageShader,
  Skia,
  Shader,
  mix,
  useTiming,
  useDerivedValue,
} from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rbga;
}`)!;

export const Filters = () => {
  const progress = useTiming(
    {
      loop: true,
      yoyo: true,
    },
    { duration: 1500 }
  );
  const uniforms = useDerivedValue((p) => ({ r: mix(p, 1, 100) }), [progress]);
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader
            source={require("../../assets/oslo.jpg")}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
          />
        </Shader>
      </Paint>
      <Rect x={0} y={0} width={width} height={height} />
    </Canvas>
  );
};
