import {
  Canvas,
  Paint,
  Rect,
  usePaintRef,
  ImageShader,
  Skia,
  Shader,
  mix,
  useLoop,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform float r;

half4 main(float2 xy) {   
  xy.x += sin(xy.y / r) * 4;
  return image.eval(xy).rgba;
}`)!;

export const Filters = () => {
  const paint = usePaintRef();
  const progress = useLoop({ duration: 1500 });
  return (
    <Canvas style={{ width, height }} mode="continuous">
      <Paint ref={paint}>
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
      <Rect x={0} y={0} width={width} height={height} paint={paint} />
    </Canvas>
  );
};
