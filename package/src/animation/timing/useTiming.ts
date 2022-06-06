import { useEffect, useMemo, useRef } from "react";

import type { SkiaValue, SkiaAnimation } from "../../values/types";
import type {
  AnimationParams,
  TimingConfig,
  AnimationCallback,
} from "../types";
import { useValue } from "../../values/hooks/useValue";

import { getResolvedParams } from "./functions";
import { createTiming } from "./createTiming";

/**
 * Creats an animation value that will run whenever
 * the animation parameters change. The animation start immediately.
 * @param toOrParams
 * @param config
 * @returns A value that is animated
 */
export const useTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig,
  callback?: AnimationCallback
): SkiaValue<number> => {
  // Resolve parameters - keep a cached version to avoid
  // unnecesary re-renders.
  const prevCfgRef = useRef<ReturnType<typeof getResolvedParams>>();
  const resolvedParameters = useMemo(() => {
    const nextParams = getResolvedParams(toOrParams, config);
    if (!equals(prevCfgRef.current, nextParams)) {
      prevCfgRef.current = nextParams;
    }
    return prevCfgRef.current!;
  }, [config, toOrParams]);

  // Create value
  const value = useValue(resolvedParameters.from ?? 0);

  // Create timing animation - keep a cached version to avoid
  // uneccessary recreation of animations
  const prevAnimationRef = useRef<SkiaAnimation>();
  const prevParamsRef = useRef<typeof resolvedParameters>();
  const animation = useMemo(() => {
    if (!equals(prevParamsRef.current, resolvedParameters)) {
      prevParamsRef.current = resolvedParameters;
      prevAnimationRef.current = createTiming(
        resolvedParameters,
        value,
        callback
      );
    }
    return prevAnimationRef.current!;
  }, [callback, resolvedParameters, value]);

  // Run animation on the value - and stop it on unmount
  useEffect(() => {
    value.animation = animation;
    return () => (value.animation = undefined);
  }, [animation, value]);

  // Return the value that is animated
  return value;
};

const equals = <T1, T2>(a: T1, b: T2) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
