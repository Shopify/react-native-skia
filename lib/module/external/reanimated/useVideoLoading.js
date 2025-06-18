import { useCallback, useEffect, useState } from "react";
import { Skia } from "../../skia";
import Rea from "./ReanimatedProxy";
const runtime = Rea.createWorkletRuntime("video-metadata-runtime");
export const useVideoLoading = source => {
  const {
    runOnJS
  } = Rea;
  const [video, setVideo] = useState(null);
  const cb = useCallback(src => {
    "worklet";

    const vid = Skia.Video(src);
    runOnJS(setVideo)(vid);
  }, [runOnJS]);
  useEffect(() => {
    if (source) {
      Rea.runOnRuntime(runtime, cb)(source);
    }
  }, [cb, source]);
  return video;
};
//# sourceMappingURL=useVideoLoading.js.map