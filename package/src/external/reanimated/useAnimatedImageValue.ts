import { useEffect } from "react";
import { type FrameInfo, type SharedValue } from "react-native-reanimated";

import { useAnimatedImage } from "../../skia/core/AnimatedImage";
import type { DataSourceParam, SkImage } from "../../skia/types";

import {
  throwOnMissingReanimated,
  useFrameCallback,
  useSharedValue,
} from "./moduleWrapper";

const DEFAULT_FRAME_DURATION = 60;

export const useAnimatedImageValue = (
  source: DataSourceParam,
  paused?: SharedValue<boolean>
) => {
  throwOnMissingReanimated();
  const defaultPaused = useSharedValue(false);
  const isPaused = paused ?? defaultPaused;
  const currentFrame = useSharedValue<null | SkImage>(null);
  const lastTimestamp = useSharedValue(-1);
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
    if (isPaused.value && lastTimestamp.value !== -1) {
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
  });
  useEffect(() => {
    return () => {
      animatedImage?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return currentFrame;
};
