import { useEffect, useState } from "react";
import { Skia } from "../../skia";
export const useVideoLoading = source => {
  const [video, setVideo] = useState(null);
  useEffect(() => {
    if (source) {
      const vid = Skia.Video(source);
      vid.then(v => setVideo(v));
    }
  }, [source]);
  return video;
};
//# sourceMappingURL=useVideoLoading.web.js.map