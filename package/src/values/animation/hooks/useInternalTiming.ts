import { useEffect, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";

import type { IValue } from "../../types";
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
): IValue<number> => {
  // Resolve parameters
  const resolvedParameters = useMemo(() => {
    const p = getResolvedParams(toOrParams, config);
    // resolve from - we don't have a from value
    p.from = p.from ?? 0;
    return p;
  }, [config, toOrParams]);
  // Create animation value
  const value = useValue(resolvedParameters.from!);
  // Current animation
  const animation = useRef<IAnimation>();
  // Run animation as a side effect of the value changing
  useEffect(() => {
    // Wait until all UX interactions has finished
    if (resolvedParameters.immediate) {
      InteractionManager.runAfterInteractions(() => {
        animation.current = internalRunTiming(value, resolvedParameters);
      });
    }
    return () => {
      animation.current?.stop();
    };
  }, [resolvedParameters, value]);
  // Return the animated value
  return value;
};
