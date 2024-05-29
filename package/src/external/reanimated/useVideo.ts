import {
  runOnUI,
  useSharedValue,
  type FrameInfo,
  type SharedValue,
} from "react-native-reanimated";
import { useCallback, useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage, Video } from "../../skia/types";
import { Platform } from "../../Platform";

import Rea from "./ReanimatedProxy";

type Animated<T> = SharedValue<T> | T;

export interface PlaybackOptions {
  playbackSpeed: Animated<number>;
  looping: Animated<boolean>;
  paused: Animated<boolean>;
  seek: Animated<number | null>;
}

type Materialized<T> = {
  [K in keyof T]: T[K] extends Animated<infer U> ? U : T[K];
};

export type MaterializedPlaybackOptions = Materialized<
  Omit<PlaybackOptions, "seek">
>;

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

const setFrame = (video: Video, currentFrame: SharedValue<SkImage | null>) => {
  "worklet";
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
};

export const processVideoState = (
  video: Video | null,
  currentTimestamp: number,
  options: Materialized<Omit<PlaybackOptions, "seek">>,
  currentTime: SharedValue<number>,
  currentFrame: SharedValue<SkImage | null>,
  lastTimestamp: SharedValue<number>,
  seek: SharedValue<number | null>
) => {
  "worklet";
  if (!video) {
    return;
  }
  if (options.paused) {
    return;
  }
  const delta = currentTimestamp - lastTimestamp.value;

  const frameDuration = 1000 / video.framerate();
  const currentFrameDuration = Math.floor(
    frameDuration / options.playbackSpeed
  );
  if (currentTime.value + delta >= video.duration() && options.looping) {
    seek.value = 0;
  }
  if (seek.value !== null) {
    video.seek(seek.value);
    currentTime.value = seek.value;
    setFrame(video, currentFrame);
    lastTimestamp.value = currentTimestamp;
    seek.value = null;
    return;
  }

  if (delta >= currentFrameDuration) {
    setFrame(video, currentFrame);
    currentTime.value += delta;
    lastTimestamp.value = currentTimestamp;
  }
};

export const useVideo = (
  source: string | null,
  userOptions?: Partial<PlaybackOptions>
) => {
  const video = useMemo(() => (source ? Skia.Video(source) : null), [source]);
  const isPaused = useOption(userOptions?.paused ?? defaultOptions.paused);
  const looping = useOption(userOptions?.looping ?? defaultOptions.looping);
  const seek = useOption(userOptions?.seek ?? defaultOptions.seek);
  const playbackSpeed = useOption(
    userOptions?.playbackSpeed ?? defaultOptions.playbackSpeed
  );
  const currentFrame = Rea.useSharedValue<null | SkImage>(null);
  const currentTime = Rea.useSharedValue(0);
  const lastTimestamp = Rea.useSharedValue(-1);
  const disposeVideo = useCallback(() => {
    "worklet";
    video?.dispose();
  }, [video]);

  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    processVideoState(
      video,
      frameInfo.timestamp,
      {
        paused: isPaused.value,
        looping: looping.value,
        playbackSpeed: playbackSpeed.value,
      },
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
  });

  useEffect(() => {
    return () => {
      // TODO: should video simply be a shared value instead?
      runOnUI(disposeVideo)();
    };
  }, [disposeVideo, video]);

  return { currentFrame, currentTime };
};
