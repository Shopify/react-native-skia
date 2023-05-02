import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  clamp,
  rect,
} from "@shopify/react-native-skia";

import { snapPoint } from "./Math";
import {
  transition,
  pageCurl,
  glitchMemories,
  swap,
  linear,
} from "./transitions/index";
import { useAssets } from "./Assets";

const { width, height } = Dimensions.get("window");
const rct = rect(0, 0, width, height);
const transitions = [
  pageCurl,
  glitchMemories,
  swap,
  linear,
  glitchMemories,
  swap,
].map((t) => transition(t));

export const Transitions = () => {
  const [offset, setOffset] = useState(0);
  const progress = useSharedValue(0);
  const assets = useAssets();
  const updatePage = useCallback(() => {
    setOffset((o) => o + 1);
    progress.value = 0;
  }, [progress]);
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onChange((pos) => {
          progress.value = clamp(progress.value - pos.changeX / width, 0, 1);
        })
        .onEnd(({ velocityX }) => {
          const dst = snapPoint(progress.value, -velocityX / width, [0, 1]);
          progress.value = withTiming(dst, { duration: 250 }, () => {
            if (dst === 1) {
              runOnJS(updatePage)();
            }
          });
        }),
    [progress, updatePage]
  );
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
      <GestureDetector gesture={pan}>
        <Canvas style={{ flex: 1 }}>
          <Fill>
            <Shader source={transitions[offset]} uniforms={uniforms}>
              <ImageShader
                image={assets[offset]}
                fit="cover"
                width={width}
                height={height}
              />
              <ImageShader
                image={assets[offset + 1]}
                fit="cover"
                width={width}
                height={height}
              />
            </Shader>
          </Fill>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
