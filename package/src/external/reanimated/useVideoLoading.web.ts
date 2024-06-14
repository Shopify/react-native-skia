import { useEffect, useState } from "react";

import type { Video } from "../../skia/types";
import { Skia } from "../../skia";

type VideoSource = string | null;

export const useVideoLoading = (source: VideoSource) => {
  const [video, setVideo] = useState<Video | null>(null);
  useEffect(() => {
    if (source) {
      const vid = Skia.Video(source) as Promise<Video>;
      vid.then((v) => setVideo(v));
    }
  }, [source]);
  return video;
};
