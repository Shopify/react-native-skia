import { useEffect, useState } from "react";
import {
  createWorkletRuntime,
  runOnJS,
  runOnRuntime,
} from "react-native-reanimated";

import type { Video } from "../../skia/types";
import { Skia } from "../../skia";

const runtime = createWorkletRuntime("video-metadata-runtime");

type VideoSource = string | null;

export const useVideoLoading = (source: VideoSource) => {
  const [video, setVideo] = useState<Video | null>(null);
  const cb = (src: string) => {
    "worklet";
    const vid = Skia.Video(src) as Video;
    runOnJS(setVideo)(vid);
  };
  useEffect(() => {
    if (source) {
      runOnRuntime(runtime, cb)(source);
    }
  }, [source]);
  return video;
};
