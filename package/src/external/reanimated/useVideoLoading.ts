import { useEffect, useState } from "react";

import type { Video } from "../../skia/types";
import { Skia } from "../../skia";

import Rea from "./ReanimatedProxy";

const runtime = Rea.createWorkletRuntime("video-metadata-runtime");

type VideoSource = string | null;

export const useVideoLoading = (source: VideoSource) => {
  const runOnJS = Rea.runOnJS;
  const [video, setVideo] = useState<Video | null>(null);
  const cb = (src: string) => {
    "worklet";
    const vid = Skia.Video(src) as Video;
    runOnJS(setVideo)(vid);
  };
  useEffect(() => {
    if (source) {
      Rea.runOnRuntime(runtime, cb)(source);
    }
  }, [source]);
  return video;
};
