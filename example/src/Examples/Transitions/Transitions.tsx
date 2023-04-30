import React, { useEffect } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  ColorShader,
  Fill,
  ImageShader,
  Shader,
  clamp,
  interpolate,
  rect,
  useComputedValue,
  useImage,
  useLoop,
  useValue,
} from "@shopify/react-native-skia";

import { frag } from "../../components/ShaderLib/Tags";

import { snapPoint } from "./Math";
import { zoomInCircles } from "./transitions/zoomInCircles";
import { linear } from "./transitions/linear";

const { width, height } = Dimensions.get("window");
const rct = rect(0, 0, width, height);

const source = frag`
uniform shader image1;
uniform shader image2;

uniform float progress;
uniform float2 resolution;

half4 getFromColor(float2 uv) {
  return image1.eval(uv * resolution);
}

half4 getToColor(float2 uv) {
  return image2.eval(uv * resolution);
}

${linear}

half4 main(vec2 xy) {
  vec2 uv = xy / resolution;
  return linear(
    uv
  );
}

`;

export const Transitions = () => {
  const progress = useSharedValue(0);
  const image1 = useImage(require("./assets/1.jpg"));
  const image2 = useImage(require("./assets/2.jpg"));
  const image3 = useImage(require("./assets/3.jpg"));

  const pan = Gesture.Pan()
    .onChange((pos) => {
      progress.value += pos.changeX / width;
    })
    .onEnd(({ velocityX }) => {
      const dst = snapPoint(progress.value, velocityX / width, [-1, 0, 1]);
      progress.value = withTiming(dst);
    });
  const uniforms1 = useDerivedValue(() => {
    const p = interpolate(progress.value, [0, 1], [1, 0], "clamp");
    console.log({ progress12: p });
    return {
      progress: p,
      resolution: [width, height],
    };
  });
  const uniforms2 = useDerivedValue(() => {
    return {
      progress: interpolate(progress.value, [-1, 0], [0, 1], "clamp"),
      resolution: [width, height],
    };
  });
  if (!image1 || !image2 || !image3) {
    return null;
  }
  // <ImageShader image={image1} fit="cover" rect={rct} />
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={source} uniforms={uniforms2}>
            <Shader source={source} uniforms={uniforms1}>
              <ColorShader color="cyan" />
              <ColorShader color="magenta" />
            </Shader>
            <ColorShader color="yellow" />
          </Shader>
        </Fill>
      </Canvas>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
};
