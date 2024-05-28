import {
  runOnUI,
  useSharedValue,
  type FrameInfo,
  type SharedValue,
} from "react-native-reanimated";
import { useCallback, useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage } from "../../skia/types";
import { Platform } from "../../Platform";

import Rea from "./ReanimatedProxy";

type Animated<T> = SharedValue<T> | T;

export interface PlaybackOptions {
  playbackSpeed: Animated<number>;
  looping: Animated<boolean>;
  paused: Animated<boolean>;
  seek: Animated<number | null>;
  currentTime: Animated<number>;
}

const defaultOptions = {
  playbackSpeed: 1,
  looping: true,
  paused: false,
  seek: null,
  currentTime: 0,
};

const useOption = <T>(value: Animated<T>) => {
  "worklet";
  // TODO: only create defaultValue is needed (via makeMutable)
  const defaultValue = useSharedValue(
    Rea.isSharedValue(value) ? value.value : value
  );
  return Rea.isSharedValue(value) ? value : defaultValue;
};

export const useVideo = (
  source: string | null,
  userOptions?: Partial<PlaybackOptions>
) => {
  const video = useMemo(() => (source ? Skia.Video(source) : null), [source]);
  const isPaused = useOption(userOptions?.paused ?? defaultOptions.paused);
  const looping = useOption(userOptions?.looping ?? defaultOptions.looping);
  const seek = useOption(userOptions?.seek ?? defaultOptions.seek);
  const currentTime = useOption(userOptions?.currentTime ?? defaultOptions.currentTime);
  const playbackSpeed = useOption(
    userOptions?.playbackSpeed ?? defaultOptions.playbackSpeed
  );
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
    if (seek.value !== null) {
      video.seek(seek.value);
      seek.value = null;
      lastTimestamp.value = -1;
      startTimestamp.value = -1;
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
    currentTime.value = currentTimestamp;

    // Handle looping
    if (currentTimestamp > duration && looping.value) {
      video.seek(0);
      startTimestamp.value = timestamp;
    }

    // Update frame only if the elapsed time since last update is greater than the frame duration
    const currentFrameDuration = Math.floor(
      frameDuration / playbackSpeed.value
    );
    const delta = Math.floor(timestamp - lastTimestamp.value);
    if (lastTimestamp.value === -1 || delta >= currentFrameDuration) {
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
