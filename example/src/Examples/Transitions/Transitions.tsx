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
  useImage,
} from "@shopify/react-native-skia";

import { snapPoint } from "./Math";
import { transition, linear, glitchMemories } from "./transitions";

const { width, height } = Dimensions.get("window");
const rct = rect(0, 0, width, height);

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
    return {
      progress: progress.value,
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
          <Shader
            source={transition(glitchMemories, linear)}
            uniforms={uniforms}
          >
            <ImageShader image={image1} fit="cover" rect={rct} />
            <ImageShader image={image2} fit="cover" rect={rct} />
            <ImageShader image={image3} fit="cover" rect={rct} />
          </Shader>
        </Fill>
      </Canvas>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
};
