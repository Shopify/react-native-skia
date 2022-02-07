import { useCallback, useEffect, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";

import type { AnimationValue } from "../types";
import { useValue } from "../Value";

import { createSpring, createTimeline, createTiming } from "./functions";
import { AnimationFactory } from "./animationFactory";
import type {
  DurationInfoParameters,
  InterpolatorParams,
  EasingInfo,
} from "./interpolatorAnimationFactory";
import type { TimelineAnimation } from "./timelineAnimationFactory";
import type { BaseAnimation } from "./types";

const useAnimation = (
  animation: BaseAnimation,
  from?: number
): AnimationValue => {
  const value = useValue(from ?? 0);
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => animation.start(value));
    return () => animation.stop();
  }, [animation, value]);
  return value;
};

/**
 * Creates a new timeline animation. A timeline animation can run multiple
 * animations with complex control over when each animation starts and stops using
 * advanced positioning and staggering options.
 * @param initializer Initialization callback for building the timeline
 * @returns An animation value that will be updated by the animation
 */
export const useTimeline = (initializer: (tla: TimelineAnimation) => void) => {
  const retVal = useMemo(() => {
    return createTimeline(initializer);
  }, [initializer]);
  return useAnimation(retVal);
};

/**
 * Creates an animation value where the provided value will be updated with
 * the progress in seconds since the animation started.
 * @returns An animation value that will be updated by the animation
 */
export const useTimestamp = (): AnimationValue => {
  const animation = useMemo(() => {
    return AnimationFactory();
  }, []);

  return useAnimation(animation);
};

type TimingParams = DurationInfoParameters & InterpolatorParams;

/**
 * Creates an interpolated animation where the provided value will be updated with
 * the interpolated value between from and to over the duration of time.
 * @param params Parameters for the timing animation
 * @returns An animation value that will be updated by the animation
 */
export const useTiming = (params: TimingParams) => {
  const animation = useMemo(() => {
    return createTiming(params);
  }, [params]);

  return useAnimation(animation);
};
/**
 * Creates a spring based animation where the provided value will be updated with
 * the interpolated value between from and to over the duration of time.
 * @param params a number for the destination value or an interpolation configuration
 * @param config spring configuration
 * @returns An animation value that will be updated by the animation
 */
export const useSpring = (
  params: number | Pick<InterpolatorParams, "from" | "to">,
  config: EasingInfo
): AnimationValue => {
  const animation = useMemo(() => {
    return createSpring(params, config);
  }, [params, config]);

  return useAnimation(animation);
};

type LoopConfig = {
  /*
    Number of repeats, from 0 to infinity. Defaults to infinity
    */
  repeat?: number;
  /*
    Reverse on odd animation iterations. Defaults to false
    */
  yoyo?: boolean;
};

/**
 * Runs a timing animation in a loop
 * @param params Parameters for the timing animation
 * @param config Loop configuration
 * @returns An animation value that will be updated by the animation
 */
export const useLoop = (
  params: TimingParams | BaseAnimation,
  config?: LoopConfig
) => {
  const iterationsRef = useRef(0);
  const animation = useMemo(
    () =>
      "start" in params && "update" in params
        ? (params as BaseAnimation)
        : createTiming(params),
    [params]
  );
  const paramsResolved = useMemo(
    () => ({
      repeat: config?.repeat ?? Infinity,
      yoyo: config?.yoyo ?? false,
    }),
    [config]
  );
  const value = useValue(0);
  const startAnimation = useCallback(() => {
    if (
      paramsResolved.repeat === Infinity ||
      iterationsRef.current <= (paramsResolved.repeat ?? 0)
    ) {
      iterationsRef.current++;
      (iterationsRef.current % 2 === 1 ? animation.start : animation.reverse)(
        value
      ).then(startAnimation);
    }
  }, [animation, value, paramsResolved]);

  useEffect(() => {
    InteractionManager.runAfterInteractions(startAnimation);
    return () => animation.stop();
  }, [animation, startAnimation]);

  return value;
};
