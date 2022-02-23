import { useEffect, useMemo, useRef } from "react";

import type { ControllableValue } from "../../types";
import { getResolvedParams } from "../functions/getResolvedParams";
import type { AnimationParams, TimingConfig, SpringConfig } from "../types";
import { internalCreateTiming } from "../create/internalCreateTiming";

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
): ControllableValue => {
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

  // Create timing
  const prevAnimationRef = useRef<ControllableValue>();
  const prevParamsRef = useRef<typeof resolvedParameters>();
  const animation = useMemo(() => {
    if (!equals(prevParamsRef.current, resolvedParameters)) {
      prevParamsRef.current = resolvedParameters;
      prevAnimationRef.current = internalCreateTiming(
        resolvedParameters,
        prevAnimationRef.current
      );
    }
    return prevAnimationRef.current!;
  }, [resolvedParameters]);

  // Run animation as a side effect of the animation being
  // recreated
  useEffect(() => {
    if (resolvedParameters.immediate) {
      animation.start();
    }
    return animation.stop;
  }, [animation, resolvedParameters.immediate]);

  // Return the animation
  return animation;
};

const equals = <T1, T2>(a: T1, b: T2) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
