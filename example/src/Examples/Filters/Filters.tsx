import {
  Canvas,
  Paint,
  Rect,
  usePaintRef,
  ImageShader,
  Skia,
  Shader,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const source = Skia.RuntimeEffect.Make(`
uniform shader image;

half4 main(float2 xy) {                      
  return image.eval(xy).rgba;
}`)!;

export const Filters = () => {
  const paint = usePaintRef();
  return (
    <Canvas style={{ width, height }}>
      <Paint ref={paint}>
        <Shader source={source}>
          <ImageShader
            source={require("../../assets/oslo.jpg")}
            transform={[{ scale: 0.25 }]}
          />
        </Shader>
      </Paint>
      <Rect x={0} y={0} width={width} height={height} paint={paint} />
    </Canvas>
  );
};
