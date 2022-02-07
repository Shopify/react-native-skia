import React from "react";
import { Dimensions } from "react-native";
import {
  useImage,
  Canvas,
  Paint,
  ImageShader,
  Skia,
  Shader,
  Fill,
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
  const image = useImage(require("../../assets/oslo.jpg"));
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <Shader source={source} uniforms={() => ({ r: 100 })}>
          <ImageShader
            image={image}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
          />
        </Shader>
      </Paint>
      <Fill />
    </Canvas>
  );
};
