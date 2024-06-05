import type { SharedValue } from "react-native-reanimated";

import type { SkImage, Video } from "../../skia/types";
import { Platform } from "../../Platform";

export type Animated<T> = SharedValue<T> | T;
// TODO: Move to useVideo.ts
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

// TODO: move
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
