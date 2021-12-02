import React, { useRef } from "react";
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
  useAnimation,
} from "@shopify/react-native-skia";
import type { SkiaView } from "@shopify/react-native-skia";

const { width, height } = Dimensions.get("window");

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rgba;
}`)!;

export const Filters = () => {
  const skiaRef = useRef<SkiaView>(null);
  const progress = useAnimation(skiaRef);
  useLoop(progress, { duration: 1500 });
  return (
    <Canvas style={{ width, height }} innerRef={skiaRef}>
      <Paint>
        <Shader
          source={source}
          uniforms={(ctx) => [mix(progress(ctx), 0, 100)]}
        >
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
