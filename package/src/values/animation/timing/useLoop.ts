import type { TimingConfig } from "../types";

import { useTiming } from "./useTiming";

/**
 * Configures a looped timing value. The value will go back and forth
 * between 0 and 1 and back.
 * @param config Timing configuration for easing and duration
 * @returns A value that can be used for further animations
 */
export const useLoop = (config?: TimingConfig) =>
  useTiming(
    {
      yoyo: true,
      loop: true,
    },
    config
  );
