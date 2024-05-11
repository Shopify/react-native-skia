import type { FrameInfo, SharedValue } from "react-native-reanimated";
import { useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage } from "../../skia/types";
import { Platform } from "../../Platform";

import Rea from "./ReanimatedProxy";

export const useVideo = (
  source: string | null,
  looped?: boolean,
  paused?: SharedValue<boolean>
) => {
  const video = useMemo(() => (source ? Skia.Video(source) : null), [source]);
  const defaultPaused = Rea.useSharedValue(false);
  const isPaused = paused ?? defaultPaused;
  const currentFrame = Rea.useSharedValue<null | SkImage>(null);
  const lastTimestamp = Rea.useSharedValue(-1);
  const frameDuration = useMemo(
    () => (video ? (1 / video.framerate()) * 1000 : -1),
    [video]
  );
  const duration = useMemo(() => (video ? video.duration() : -1), [video]);

  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    if (!video) {
      return;
    }
    if (isPaused.value && lastTimestamp.value !== -1) {
      return;
    }
    const { timestamp } = frameInfo;
    const elapsed = timestamp - lastTimestamp.value;


    // Check if it's time to switch frames based on frame duration
    if (elapsed < frameDuration) {
      return;
    }

    // Update the current frame
    const img = video.nextImage();
    if (img) {
      if (currentFrame.value) {
        currentFrame.value.dispose();
      }
      if (Platform.OS === "android") {
        currentFrame.value = img.makeNonTextureImage();
      } else {
        currentFrame.value = img;
      }
    }

    // Update the last timestamp
    lastTimestamp.value = timestamp;
  });
  useEffect(() => {
    return () => {
      video?.dispose();
    };
  }, [video]);
  return currentFrame;
};
