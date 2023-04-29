import React from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  interpolate,
  rect,
  useImage,
} from "@shopify/react-native-skia";

import { frag } from "../../components/ShaderLib/Tags";

import { snapPoint } from "./Math";
import { zoomInCircles } from "./transitions/zoomInCircles";

const { width, height } = Dimensions.get("window");
const rct = rect(0, 0, width, height);

const source = frag`
uniform shader image1;
uniform shader image2;
uniform shader image3;

uniform half progress;
uniform float2 resolution;

half4 getFromColor(float2 uv) {
  return image1.eval(uv * resolution);
}

half4 getToColor(float2 uv) {
  return image2.eval(uv * resolution);
}

${zoomInCircles}

half4 main(vec2 xy) {
  vec2 uv = xy / resolution;
  return zoomInCircles(
    uv
  );
}

`;

export const Transitions = () => {
  const x = useSharedValue(0);
  const image1 = useImage(require("./assets/1.jpg"));
  const image2 = useImage(require("./assets/2.jpg"));
  const image3 = useImage(require("./assets/3.jpg"));
  const pan = Gesture.Pan()
    .onChange((pos) => {
      x.value += pos.changeX;
    })
    .onEnd(({ velocityX }) => {
      const dst = snapPoint(x.value, velocityX, [0, -width, -2 * width]);
      x.value = withTiming(dst);
    });
  const uniforms = useDerivedValue(() => {
    const progress = interpolate(x.value, [0, -width, -2 * width], [0, 1, 2]);
    console.log(progress);
    return {
      progress,
      resolution: [width, height],
    };
  });
  if (!image1 || !image2 || !image3) {
    return null;
  }
  return (
    <GestureDetector gesture={pan}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={source} uniforms={uniforms}>
            <ImageShader image={image1} fit="cover" rect={rct} />
            <ImageShader image={image2} fit="cover" rect={rct} />
            <ImageShader image={image3} fit="cover" rect={rct} />
          </Shader>
        </Fill>
      </Canvas>
    </GestureDetector>
  );
};
