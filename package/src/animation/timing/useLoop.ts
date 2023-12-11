import type { TimingConfig } from "../types";

import { useTiming } from "./useTiming";

/**
 * @deprecated Use Reanimated 3 for animations:
 * https://shopify.github.io/react-native-skia/docs/animations/animations
 *
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
