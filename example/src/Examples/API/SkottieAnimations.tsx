import React, { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  Skia,
  SkottieAnimation,
  useTiming,
  Easing,
} from "@shopify/react-native-skia";

import _LottieAnim from "../../assets/material_wave_loading.json";

const LottieAnim = JSON.stringify(_LottieAnim);

export const SkottieAnimations = () => {
  const { width, height } = useWindowDimensions();

  // TODO: build a hook that abstracts this logic
  const skottieAnimation = useMemo(() => Skia.SkottieAnimation(LottieAnim), []);

  const progress = useTiming(1, {
    duration: skottieAnimation.duration * 1000,
    easing: Easing.linear,
  });

  return (
    <ScrollView>
      <Canvas style={{ width, height }}>
        <SkottieAnimation
          x={0}
          y={0}
          width={width}
          height={height}
          progress={progress}
          anim={skottieAnimation}
        />
      </Canvas>
    </ScrollView>
  );
};
