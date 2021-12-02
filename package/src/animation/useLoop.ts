import { useEffect } from "react";

import type { AnimationValue } from "./types";
import type { TimingConfig } from "./functions";
import { runLoop } from "./runLoop";

export const useLoop = (
  animationValue: AnimationValue,
  config?: TimingConfig & { yoyo?: boolean }
) => {
  useEffect(() => {
    runLoop(animationValue, config);
  }, [animationValue, config]);
};
