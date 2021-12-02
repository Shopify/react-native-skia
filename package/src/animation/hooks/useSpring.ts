import { useMemo } from "react";

import type { AnimationValue } from "../types";
import { Springs } from "../Springs";
import type { SpringParams } from "../Springs";

import { useAnimation } from "./useAnimation";

export const useSpring = (
  animationValue: AnimationValue,
  params: SpringParams,
  startPaused = false
) => {
  const animation = useMemo(
    () => Springs.create(animationValue, params),
    [animationValue, params]
  );

  return useAnimation(animation, startPaused);
};
