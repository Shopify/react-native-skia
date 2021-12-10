import { useCallback, useEffect } from "react";

import type { AnimationValue, Animation } from "../types";

export const useLoop = (value: AnimationValue, animation: Animation) => {
  const startAnimation = useCallback(() => {
    animation.start(value).then(() => {
      return startAnimation();
    });
  }, [animation, value]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return animation;
};
