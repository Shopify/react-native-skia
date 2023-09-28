import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  Image,
  SkAnimatedImage,
  SkImage,
  useAnimatedImage,
} from "@shopify/react-native-skia";
import { useSharedValue, useFrameCallback } from "react-native-reanimated";

const AnimatedImage = ({
  animatedImage,
}: {
  animatedImage: SkAnimatedImage | null;
}) => {
  // Many gifs are incorrectly encoded and have a frame duration of 0 so we set a default of 60ms
  const DEFAULT_FRAME_DURATION = 60;

  const currentFrame = useSharedValue<SkImage | null>(null);
  const lastTimestamp = useSharedValue(0);
  const frameDuration =
    animatedImage?.currentFrameDuration() || DEFAULT_FRAME_DURATION;

  useFrameCallback((frameInfo) => {
    if (!animatedImage) {
      currentFrame.value = null;
      return;
    }

    const timestamp = frameInfo.timestamp;
    const elapsed = timestamp - lastTimestamp.value;

    // Check if it's time to switch frames based on GIF frame duration
    if (elapsed < frameDuration) {
      return;
    }

    // Update the current frame
    animatedImage.decodeNextFrame();
    currentFrame.value = animatedImage.getCurrentFrame();

    // Update the last timestamp
    lastTimestamp.value = timestamp;
  }, true);

  return (
    <Image
      image={currentFrame}
      x={0}
      y={0}
      width={320}
      height={180}
      fit="contain"
    />
  );
};

export const AnimatedImages = () => {
  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

  // TODO - move this to a test
  // Verifies that the error handler for animated images are working correctly.
  useAnimatedImage(new Uint8Array([0, 0, 0, 255]), (err) => {
    if (err.message !== "Could not load data") {
      throw new Error(
        `Expected error message to be 'Could not load data' - got '${err.message}'`
      );
    }
  });
  useAnimatedImage("https://reactjs.org/invalid.jpg", (err) => {
    if (err.message !== "Could not load data") {
      throw new Error(
        `Expected error message to be 'Could not load data' - got '${err.message}'`
      );
    }
  });
  // Verifies that we can use this hook with a null/undefined input parameter
  useAnimatedImage(null);
  useAnimatedImage(undefined);

  const example1 = useAnimatedImage(require("../../assets/birdFlying.gif"));
  const example2 = useAnimatedImage(require("../../assets/birdFlying2.gif"));

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
        <AnimatedImage animatedImage={example1} />
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
        <AnimatedImage animatedImage={example2} />
      </Canvas>
    </ScrollView>
  );
};
