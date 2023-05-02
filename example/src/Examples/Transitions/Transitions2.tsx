import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  rect,
} from "@shopify/react-native-skia";

import { snapPoint } from "./Math";
import { cube, pageCurl, transition2 } from "./transitions/index";
import { useAssets } from "./Assets";

const { width, height } = Dimensions.get("window");
const rct = rect(0, 0, width, height);

export const Transitions = () => {
  const progress = useSharedValue(0);
  const assets = useAssets();
  const pan = Gesture.Pan()
    .onChange((pos) => {
      progress.value += pos.changeX / width;
    })
    .onEnd(({ velocityX }) => {
      const dst = snapPoint(progress.value, velocityX / width, [-1, 0, 1]);
      progress.value = withTiming(dst);
    });
  const uniforms = useDerivedValue(() => {
    return {
      progress: progress.value,
      resolution: [width, height],
    };
  });
  if (!assets) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <Shader source={transition2(pageCurl, cube)} uniforms={uniforms}>
            <ImageShader image={assets[0]} fit="cover" rect={rct} />
            <ImageShader image={assets[1]} fit="cover" rect={rct} />
            <ImageShader image={assets[2]} fit="cover" rect={rct} />
          </Shader>
        </Fill>
      </Canvas>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
};
