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
  // Resolve parameters
  const resolvedParameters = useMemo(
    () => getResolvedParams(toOrParams, config),
    [config, toOrParams]
  );

  // Create timing
  const prevAnimationRef = useRef<ControllableValue>();
  const animation = useMemo(() => {
    prevAnimationRef.current?.stop();
    prevAnimationRef.current = internalCreateTiming(
      resolvedParameters,
      prevAnimationRef.current
    );
    return prevAnimationRef.current;
  }, [resolvedParameters]);

  // Run animation as a side effect of the value changing
  useEffect(() => {
    animation.start();
    return animation.stop;
  }, [animation]);

  // Return the animation
  return animation;
};
