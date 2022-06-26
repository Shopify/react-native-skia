import React from "react";
import { useWindowDimensions } from "react-native";
import {
  useImage,
  Canvas,
  ImageShader,
  Skia,
  Shader,
  mix,
  useComputedValue,
  Fill,
  useLoop,
} from "@shopify/react-native-skia";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rbga;
}`)!;

export const Filters = () => {
  const { width, height } = useWindowDimensions();
  const progress = useLoop({ duration: 1500 });

  const uniforms = useComputedValue(
    () => ({ r: mix(progress.current, 1, 100) }),
    [progress]
  );

  const image = useImage(require("../../assets/oslo.jpg"));
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ width, height }}>
      <Fill>
        <Shader source={source} uniforms={uniforms}>
          <ImageShader
            image={image}
            fit="cover"
            x={0}
            y={0}
            width={width}
            height={height}
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
