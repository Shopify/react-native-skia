import { useEffect } from "react";

import type { Animation } from "../types";

export const useAnimation = (animation: Animation, startPaused = false) => {
  useEffect(() => {
    if (!startPaused) {
      animation.start();
    }
  }, [animation, startPaused]);
  return animation;
};
