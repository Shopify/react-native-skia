import {
  type SharedValue,
  type FrameInfo,
  createWorkletRuntime,
  runOnJS,
  runOnRuntime,
} from "react-native-reanimated";
import { useEffect, useMemo, useState } from "react";

import { Skia } from "../../skia/Skia";
import type { SkImage, Video } from "../../skia/types";
import { Platform } from "../../Platform";

import Rea from "./ReanimatedProxy";

type Animated<T> = SharedValue<T> | T;

interface PlaybackOptions {
  looping: Animated<boolean>;
  paused: Animated<boolean>;
  seek: Animated<number | null>;
  volume: Animated<number>;
}

const copyFrameOnAndroid = (currentFrame: SharedValue<SkImage | null>) => {
  "worklet";
  // on android we need to copy the texture before it's invalidated
  if (Platform.OS === "android") {
    const tex = currentFrame.value;
    if (tex) {
      console.log("Copying frame on Android");
      currentFrame.value = tex.makeNonTextureImage();
      tex.dispose();
    }
  }
};

const setFrame = (video: Video, currentFrame: SharedValue<SkImage | null>) => {
  "worklet";
  const img = video.nextImage();
  if (img) {
    if (currentFrame.value) {
      currentFrame.value.dispose();
    }
    currentFrame.value = img;
  } else {
    copyFrameOnAndroid(currentFrame);
  }
};

const defaultOptions = {
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

const runtime = createWorkletRuntime("video-metadata-runtime");

type VideoSource = string | null;

const useVideoLoading = (source: VideoSource) => {
  const [video, setVideo] = useState<Video | null>(null);
  const cb = (src: string) => {
    "worklet";
    const vid = Skia.Video(src);
    runOnJS(setVideo)(vid);
  };
  useEffect(() => {
    if (source) {
      runOnRuntime(runtime, cb)(source);
    }
  }, [source]);
  return video;
};

export const useVideo = (
  source: string | null,
  userOptions?: Partial<PlaybackOptions>
) => {
  const video = useVideoLoading(source);
  const isPaused = useOption(userOptions?.paused ?? defaultOptions.paused);
  const looping = useOption(userOptions?.looping ?? defaultOptions.looping);
  const seek = useOption(userOptions?.seek ?? defaultOptions.seek);
  const volume = useOption(userOptions?.volume ?? defaultOptions.volume);
  const currentFrame = Rea.useSharedValue<null | SkImage>(null);
  const currentTime = Rea.useSharedValue(0);
  const lastTimestamp = Rea.useSharedValue(-1);
  const duration = useMemo(() => video?.duration() ?? 0, [video]);
  const framerate = useMemo(() => video?.framerate() ?? 0, [video]);
  const size = useMemo(() => video?.size() ?? { width: 0, height: 0 }, [video]);
  const rotation = useMemo(() => video?.rotation() ?? 0, [video]);
  const frameDuration = 1000 / framerate;
  const currentFrameDuration = Math.floor(frameDuration);
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
        copyFrameOnAndroid(currentFrame);
        video?.seek(value);
        currentTime.value = value;
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

    const isOver = currentTime.value + delta > duration;
    if (isOver && looping.value) {
      seek.value = 0;
      currentTime.value = seek.value;
      lastTimestamp.value = currentTimestamp;
    }
    if (delta >= currentFrameDuration && !isOver) {
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
