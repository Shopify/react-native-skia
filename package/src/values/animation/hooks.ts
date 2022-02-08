import { useEffect, useMemo } from "react";
import { InteractionManager } from "react-native";

import type { IValue } from "../types";
import { useValue } from "../hooks";

import { getResolvedParams } from "./params";
import type { AnimationParams, TimingConfig, SpringConfig } from "./types";
import { internalRunTiming } from "./run";
import { Spring } from "./Spring";

/**
 * Creats a timing based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useTiming = (
  toOrParams: number | AnimationParams,
  config?: TimingConfig
): IValue<number> => useInternalTiming(toOrParams, config);

/**
 * Creats a spring based animation value that will run whenever
 * the animation parameters change.
 * @param toOrParams
 * @param config
 * @returns
 */
export const useSpring = (
  toOrParams: number | AnimationParams,
  config?: SpringConfig
): IValue<number> =>
  useInternalTiming(toOrParams, config ?? Spring.Config.Default);

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
  const resolvedParameters = useMemo(
    () => getResolvedParams(toOrParams, config),
    [config, toOrParams]
  );
  // Create animation value
  const value = useValue(resolvedParameters.from);
  // Run animation as a side effect of the value changing
  useEffect(() => {
    // Wait until all UX interactions has finished
    if (resolvedParameters.immediate) {
      InteractionManager.runAfterInteractions(() => {
        internalRunTiming(value, resolvedParameters);
      });
    }
  }, [resolvedParameters, value]);
  // Return the animated value
  return value;
};
