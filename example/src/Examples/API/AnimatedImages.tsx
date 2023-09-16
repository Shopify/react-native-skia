import React, { useEffect } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  Image,
  SkAnimatedImage,
  SkImage,
  useAnimatedImage,
} from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";
import { base64Gif } from "./base64Gif";

export const AnimatedImages = () => {
  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

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
  const currentFrame1 = useCurrentFrame(example1);

  const example2 = useAnimatedImage(base64Gif);
  const currentFrame2 = useCurrentFrame(example2);

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
          image={currentFrame1}
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
          image={currentFrame2}
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

/**
 * Custom hook that returns the current frame of an animated image
 *
 * @param animatedImage
 * @returns the current frame as a SkImage or null
 */
const useCurrentFrame = (animatedImage: SkAnimatedImage | null) => {
  // Many gifs are incorrectly encoded and have a frame duration of 0 so we set a minimum of 60ms
  // This is consistent with the behavior of web browsers
  const MIN_FRAME_DURATION = 60;
  const currentFrame = useSharedValue<SkImage | null>(null);

  useEffect(() => {
    if (!animatedImage) {
      currentFrame.value = null;
      return;
    }

    currentFrame.value = animatedImage.getCurrentFrame();
    let frameDuration = animatedImage.currentFrameDuration();

    const runAnimation = async () => {
      while (frameDuration > -1) {
        // Wait the duration of the current frame
        await delay(Math.max(frameDuration, MIN_FRAME_DURATION));
        frameDuration = animatedImage.decodeNextFrame();
        currentFrame.value = animatedImage.getCurrentFrame();
      }
    };

    runAnimation();
  }, [animatedImage]);

  return currentFrame;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
