import { useEffect, useMemo, useRef } from "react";

import type { Value } from "../../types";
import { useValue } from "../../hooks";
import { getResolvedParams } from "../functions/getResolvedParams";
import type {
  AnimationParams,
  TimingConfig,
  SpringConfig,
  IAnimation,
} from "../types";
import { internalRunTiming } from "../run/internalRunTiming";

/**
 * Creats an animation value that will run whenever
 * the animation parameters change. The animation start immediately.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useInternalTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig | SpringConfig
): Value<number> => {
  // Resolve parameters
  const resolvedParameters = useMemo(
    () => getResolvedParams(toOrParams, config),
    [config, toOrParams]
  );
  // Create animation value
  const value = useValue(resolvedParameters.from ?? 0);
  // Current animation
  const animation = useRef<IAnimation>();
  // Run animation as a side effect of the value changing
  useEffect(() => {
    // Wait until all UX interactions has finished
    if (resolvedParameters.immediate) {
      animation.current = internalRunTiming(value, resolvedParameters);
    }
    return () => {
      animation.current?.stop();
    };
  }, [resolvedParameters, value]);
  // Return the animated value
  return value;
};
