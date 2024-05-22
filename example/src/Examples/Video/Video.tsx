import React from "react";
import { Canvas, Fill, ImageShader } from "@shopify/react-native-skia";
import { Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { useVideoFromAsset } from "../../components/Animations";

export const Video = () => {
  const isPaused = useSharedValue(false);
  const { width, height } = useWindowDimensions();
  const video = useVideoFromAsset(
    require("../../Tests/assets/BigBuckBunny.mp4")
  );
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => (isPaused.value = !isPaused.value)}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <ImageShader
            image={video}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Fill>
      </Canvas>
    </Pressable>
  );
};
