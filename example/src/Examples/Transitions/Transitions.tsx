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
uniform shader image3;

uniform float p1;
uniform float p2;
uniform float2 resolution;

half4 getColor1(float2 uv) {
  return image1.eval(uv * resolution);
}

half4 getColor2(float2 uv) {
  return image2.eval(uv * resolution);
}

half4 getColor3(float2 uv) {
  return image3.eval(uv * resolution);
}

${linear}

half4 main(vec2 xy) {
  vec2 uv = xy / resolution;
  if (p2 > 0) {
    return linear2(
      uv
    );
  } else {
    return linear1(
      uv
    );
  }
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
  const uniforms = useDerivedValue(() => {
    const p2 = interpolate(progress.value, [0, 1], [0, 1], "clamp");
    const p1 = interpolate(progress.value, [-1, 0], [1, 0], "clamp");
    return {
      p1,
      p2,
      resolution: [width, height],
    };
  });
  if (!image1 || !image2 || !image3) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={source} uniforms={uniforms}>
            <ColorShader color="yellow" />
            <ColorShader color="cyan" />
            <ColorShader color="magenta" />
          </Shader>
        </Fill>
      </Canvas>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
};
