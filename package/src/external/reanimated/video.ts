import type { SharedValue } from "react-native-reanimated";

import type { SkImage, Video } from "../../skia/types";
import { Platform } from "../../Platform";

export type Animated<T> = SharedValue<T> | T;

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

export const setFrame = (
  video: Video,
  currentFrame: SharedValue<SkImage | null>
) => {
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
  duration: number,
  framerate: number,
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
  // if (options.paused) {
  //   return;
  // }
  const delta = currentTimestamp - lastTimestamp.value;

  const frameDuration = 1000 / framerate;
  const currentFrameDuration = Math.floor(
    frameDuration / options.playbackSpeed
  );
  // if (currentTime.value + delta >= duration && options.looping) {
  //   seek.value = 0;
  // }
  // if (seek.value !== null) {
  //   video.seek(seek.value);
  //   currentTime.value = seek.value;
  //   setFrame(video, currentFrame);
  //   lastTimestamp.value = currentTimestamp;
  //   seek.value = null;
  //   return;
  // }

  if (delta >= currentFrameDuration) {
    setFrame(video, currentFrame);
    currentTime.value += delta;
    lastTimestamp.value = currentTimestamp;
  }
};
