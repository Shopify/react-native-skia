import { useCallback, useEffect, useState } from "react";

import type { Video } from "../../skia/types";
import { Skia } from "../../skia";

import Rea from "./ReanimatedProxy";

const runtime = Rea.createWorkletRuntime("video-metadata-runtime");

type VideoSource = string | null;

export const useVideoLoading = (source: VideoSource) => {
  const { runOnJS } = Rea;
  const [video, setVideo] = useState<Video | null>(null);
  const cb = useCallback(
    (src: string) => {
      "worklet";
      const vid = Skia.Video(src) as Video;
      runOnJS(setVideo)(vid);
    },
    [runOnJS]
  );
  useEffect(() => {
    if (source) {
      Rea.runOnRuntime(runtime, cb)(source);
    }
  }, [cb, source]);
  return video;
};
