import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import { Canvas, SkottieAnimation } from "@shopify/react-native-skia";

import _LottieAnim from "../../assets/techno_penguin.json";

const LottieAnim = JSON.stringify(_LottieAnim);

export const SkottieAnimations = () => {
  const { width, height } = useWindowDimensions();

  return (
    <ScrollView>
      <Canvas style={{ width, height }}>
        <SkottieAnimation
          width={width}
          height={height}
          x={0}
          y={0}
          color={"red"}
          anim={LottieAnim}
        />
      </Canvas>
    </ScrollView>
  );
};
