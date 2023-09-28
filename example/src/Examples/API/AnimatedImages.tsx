import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import type { DataSourceParam, SkImage } from "@shopify/react-native-skia";
import { Canvas, Image, useAnimatedImage } from "@shopify/react-native-skia";
import { useSharedValue, useFrameCallback } from "react-native-reanimated";

const DEFAULT_FRAME_DURATION = 60;

const useAnimatedImageValue = (source: DataSourceParam) => {
  const currentFrame = useSharedValue<SkImage | null>(null);
  const lastTimestamp = useSharedValue(0);
  const animatedImage = useAnimatedImage(source, (err) => {
    console.error(err);
    throw new Error(`Could not load animated image - got '${err.message}'`);
  });
  const frameDuration =
    animatedImage?.currentFrameDuration() || DEFAULT_FRAME_DURATION;

  useFrameCallback((frameInfo) => {
    if (!animatedImage) {
      currentFrame.value = null;
      return;
    }

    const { timestamp } = frameInfo;
    const elapsed = timestamp - lastTimestamp.value;

    // Check if it's time to switch frames based on GIF frame duration
    if (elapsed < frameDuration) {
      return;
    }

    // Update the current frame
    animatedImage.decodeNextFrame();
    if (currentFrame.value) {
      currentFrame.value.dispose();
    }
    currentFrame.value = animatedImage.getCurrentFrame();

    // Update the last timestamp
    lastTimestamp.value = timestamp;
  }, true);
  return currentFrame;
};

export const AnimatedImages = () => {
  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

  const example1 = useAnimatedImageValue(
    require("../../assets/birdFlying.gif")
  );
  const example2 = useAnimatedImageValue(
    require("../../assets/birdFlying2.gif")
  );

  return (
    <ScrollView>
      <Canvas
        style={{
          alignSelf: "center",
          width: 320,
          height: 180,
          marginVertical: PAD,
        }}
      >
        <Image
          image={example1}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
      <Canvas
        style={{
          alignSelf: "center",
          width: 320,
          height: 180,
          borderColor: "#aaaaaa",
          borderWidth: 1,
          borderStyle: "solid",
          marginVertical: PAD,
        }}
      >
        <Image
          image={example2}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
    </ScrollView>
  );
};
