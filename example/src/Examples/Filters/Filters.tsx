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
  useLoop,
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
  const progress = useLoop({ duration: 1500 }, { yoyo: true });
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <Shader source={source} uniforms={() => [mix(progress.value, 1, 100)]}>
          <ImageShader
            source={require("../../assets/oslo.jpg")}
            fit="cover"
            fitRect={{ x: 0, y: 0, width, height }}
          />
        </Shader>
      </Paint>
      <Rect x={0} y={0} width={width} height={height} />
    </Canvas>
  );
};
