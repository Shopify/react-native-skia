import { type FrameInfo } from "react-native-reanimated";
import { useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage, Video } from "../../skia/types";

import Rea from "./ReanimatedProxy";
import {
  processVideoState,
  type Animated,
  type PlaybackOptions,
} from "./video";

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
  const defaultValue = Rea.useSharedValue(
    Rea.isSharedValue(value) ? value.value : value
  );
  return Rea.isSharedValue(value) ? value : defaultValue;
};

const disposeVideo = (video: Video | null) => {
  "worklet";
  video?.dispose();
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
  const duration = useMemo(() => video?.duration() ?? 0, [video]);
  const framerate = useMemo(() => video?.framerate() ?? 0, [video]);
  const preferedMatrix = useMemo(() => video?.preferedMatrix() ?? Skia.Matrix(), [video]);
  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    processVideoState(
      video,
      duration,
      framerate,
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
      Rea.runOnUI(disposeVideo)(video);
    };
  }, [video]);

  return { currentFrame, currentTime, duration, framerate, preferedMatrix };
};
