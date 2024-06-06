import { type FrameInfo } from "react-native-reanimated";
import { useEffect, useMemo } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage, Video } from "../../skia/types";

import Rea from "./ReanimatedProxy";
import { setFrame, type Animated, type PlaybackOptions } from "./video";

const defaultOptions = {
  playbackSpeed: 1,
  looping: true,
  paused: false,
  seek: null,
  currentTime: 0,
  volume: 0,
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
  const volume = useOption(userOptions?.volume ?? defaultOptions.volume);
  const playbackSpeed = useOption(
    userOptions?.playbackSpeed ?? defaultOptions.playbackSpeed
  );
  const currentFrame = Rea.useSharedValue<null | SkImage>(null);
  const currentTime = Rea.useSharedValue(0);
  const lastTimestamp = Rea.useSharedValue(-1);
  const duration = useMemo(() => video?.duration() ?? 0, [video]);
  const framerate = useMemo(() => video?.framerate() ?? 0, [video]);
  const size = useMemo(() => video?.size() ?? { width: 0, height: 0 }, [video]);
  const rotation = useMemo(() => video?.rotation() ?? 0, [video]);
  Rea.useAnimatedReaction(
    () => isPaused.value,
    (paused) => {
      if (paused) {
        video?.pause();
      } else {
        lastTimestamp.value = -1;
        video?.play();
      }
    }
  );
  Rea.useAnimatedReaction(
    () => seek.value,
    (value) => {
      if (value !== null) {
        video?.seek(value);
        seek.value = null;
      }
    }
  ); 
  Rea.useAnimatedReaction(
    () => volume.value,
    (value) => {
      video?.setVolume(value);
    }
  );
  Rea.useFrameCallback((frameInfo: FrameInfo) => {
    "worklet";
    if (!video) {
      return;
    }
    if (isPaused.value) {
      return;
    }
    const currentTimestamp = frameInfo.timestamp;
    if (lastTimestamp.value === -1) {
      lastTimestamp.value = currentTimestamp;
    }
    const delta = currentTimestamp - lastTimestamp.value;

    const frameDuration = 1000 / framerate;
    const currentFrameDuration = Math.floor(
      frameDuration / playbackSpeed.value
    );
    if (currentTime.value + delta >= duration && looping.value) {
      seek.value = 0;
      currentTime.value = seek.value;
      lastTimestamp.value = currentTimestamp;
    }
    if (delta >= currentFrameDuration) {
      setFrame(video, currentFrame);
      currentTime.value += delta;
      lastTimestamp.value = currentTimestamp;
    }
  });

  useEffect(() => {
    return () => {
      // TODO: should video simply be a shared value instead?
      Rea.runOnUI(disposeVideo)(video);
    };
  }, [video]);

  return {
    currentFrame,
    currentTime,
    duration,
    framerate,
    rotation,
    size,
  };
};
