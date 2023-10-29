import {
  throwOnMissingReanimated,
  useFrameCallback,
  useSharedValue,
} from "../../external/reanimated/moduleWrapper";
import { Skia } from "../Skia";
import type { DataSourceParam, SkImage } from "../types";

import { useRawData } from "./Data";

const animatedImgFactory = Skia.AnimatedImage.MakeAnimatedImageFromEncoded.bind(
  Skia.AnimatedImage
);

/**
 * Returns a Skia Animated Image object
 * */
export const useAnimatedImage = (
  source: DataSourceParam,
  onError?: (err: Error) => void
) => useRawData(source, animatedImgFactory, onError);

const DEFAULT_FRAME_DURATION = 60;

export const useAnimatedImageValue = (source: DataSourceParam) => {
  throwOnMissingReanimated();
  const currentFrame = useSharedValue<null | SkImage>(null);
  const lastTimestamp = useSharedValue(0);
  const animatedImage = useAnimatedImage(source, (err) => {
    console.error(err);
    throw new Error(`Could not load animated image - got '${err.message}'`);
  });
  const frameDuration =
    animatedImage?.currentFrameDuration() || DEFAULT_FRAME_DURATION;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFrameCallback((frameInfo: any) => {
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
  return currentFrame;
};
