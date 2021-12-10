import { useEffect } from "react";

import type { Animation, AnimationValue } from "../types";

export const useAnimation = <T extends Animation>(
  animation: T,
  animationValue?: AnimationValue
): T => {
  useEffect(() => {
    animation.start(animationValue);
  }, [animation, animationValue]);
  return animation;
};
