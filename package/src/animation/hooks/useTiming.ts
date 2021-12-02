import { useMemo } from "react";

import type { AnimationValue } from "../types";
import type { TimingConfig } from "../functions";
import { Timing } from "../Timing";

import { useAnimation } from "./useAnimation";

export const useTiming = (
  animationValue: AnimationValue,
  config: TimingConfig,
  startPaused = false
) => {
  const animation = useMemo(
    () => Timing.create(animationValue, config),
    [animationValue, config]
  );

  return useAnimation(animation, startPaused);
};
