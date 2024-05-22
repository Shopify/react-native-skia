import {
  runOnUI,
  type FrameInfo,
  type SharedValue,
} from "react-native-reanimated";
import { useCallback, useEffect, useMemo } from "react";

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
  const startTimestamp = Rea.useSharedValue(-1);

  const framerate = useMemo(() => (video ? video.framerate() : -1), [video]);
  const duration = useMemo(() => (video ? video.duration() : -1), [video]);
  const frameDuration = useMemo(
    () => (framerate > 0 ? 1000 / framerate : -1),
    [framerate]
  );
  const disposeVideo = useCallback(() => {
    "worklet";
    video?.dispose();
  }, [video]);

  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    if (!video) {
      return;
    }
    if (isPaused.value && lastTimestamp.value !== -1) {
      return;
    }
    const { timestamp } = frameInfo;

    // Initialize start timestamp
    if (startTimestamp.value === -1) {
      startTimestamp.value = timestamp;
    }

    // Calculate the current time in the video
    const currentTimestamp = timestamp - startTimestamp.value;

    // Handle looping
    if (currentTimestamp > duration && looped) {
      video.seek(0);
      startTimestamp.value = timestamp;
    }

    // Update frame only if the elapsed time since last update is greater than the frame duration
    if (
      lastTimestamp.value === -1 ||
      timestamp - lastTimestamp.value >= frameDuration
    ) {
      const img = video.nextImage();
      if (img) {
        if (currentFrame.value) {
          currentFrame.value.dispose();
        }
        if (Platform.OS === "android") {
          currentFrame.value = img; //.makeNonTextureImage();
        } else {
          currentFrame.value = img;
        }
      }
      lastTimestamp.value = timestamp;
    }
  });

  useEffect(() => {
    return () => {
      // TODO: should video simply be a shared value instead?
      runOnUI(disposeVideo)();
    };
  }, [disposeVideo, video]);

  return currentFrame;
};
