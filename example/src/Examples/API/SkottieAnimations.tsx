import React, { useEffect } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  mix,
  SkottieAnimation,
  useSharedValueEffect,
  useValue,
} from "@shopify/react-native-skia";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import _LottieAnim from "../../assets/techno_penguin.json";

const LottieAnim = JSON.stringify(_LottieAnim);

export const SkottieAnimations = () => {
  const { width, height } = useWindowDimensions();

  const progress = useValue(0);
  const animProgress = useSharedValue(0);

  useEffect(() => {
    animProgress.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1,
      true
    );
  }, [animProgress]);

  useSharedValueEffect(() => {
    progress.current = animProgress.value;
  }, animProgress);

  return (
    <ScrollView>
      <Canvas style={{ width, height }}>
        <SkottieAnimation
          x={0}
          y={0}
          width={width}
          height={height}
          anim={LottieAnim}
          progress={progress}
        />
      </Canvas>
    </ScrollView>
  );
};
