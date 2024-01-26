import { useLayoutEffect, useEffect } from "react";
import type { FrameInfo } from "react-native-reanimated";

import { useAnimatedImage } from "../../skia/core/AnimatedImage";
import type { DataSourceParam, SkImage } from "../../skia/types";

import {
  throwOnMissingReanimated,
  useFrameCallback,
  useSharedValue,
} from "./moduleWrapper";

const DEFAULT_FRAME_DURATION = 60;

export const useAnimatedImageValue = (source: DataSourceParam) => {
  throwOnMissingReanimated();
  const currentFrame = useSharedValue<null | SkImage>(null);
  const lastTimestamp = useSharedValue(0);
  const animatedImage = useAnimatedImage(
    source,
    (err) => {
      console.error(err);
      throw new Error(`Could not load animated image - got '${err.message}'`);
    },
    false
  );
  const frameDuration =
    animatedImage?.currentFrameDuration() || DEFAULT_FRAME_DURATION;

  useFrameCallback((frameInfo: FrameInfo) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, true);
  useEffect(() => {
    return () => {
      animatedImage?.dispose();
    };
  }, [animatedImage]);
  return currentFrame;
};
