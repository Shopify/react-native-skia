import { useCallback, useEffect, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";

import type { IValue } from "../types";
import { useValue } from "../hooks";

import { getResolvedParams } from "./params";
import type {
  AnimationParams,
  TimingConfig,
  SpringConfig,
  AnimationControllerParams,
  IAnimation,
} from "./types";
import { internalRunTiming } from "./run";
import { Spring } from "./Spring";
import type { ITimelineBuilder } from "./Timeline";
import { Timeline } from "./Timeline";

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
 * Creates a new memoized timeline. The timeline will be created
 * on initialization, and will not change even when the init or
 * params change.
 * @param init Callback to build the timeline
 * @param params animation controller parameters
 */
export const useTimeline = (
  init: (tlb: ITimelineBuilder) => void,
  params?: AnimationControllerParams
) => {
  const cb = useCallback(init, [init]);

  // Used as initializer
  const result = useMemo(() => {
    // Build the timeline
    const timeline = Timeline.createBuilder();
    cb(timeline);
    // Materialize the timeline
    return Timeline.build(timeline, params);
  }, [cb, params]);

  // Cleanup
  useEffect(() => result.destroy, [result]);

  return result;
};

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
  // Current animatino
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
