import { useCallback, useEffect, useMemo, useRef } from "react";
import { InteractionManager } from "react-native";

import type { AnimationValue } from "../types";

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
  value: AnimationValue,
  animation: BaseAnimation,
  startPaused?: boolean
) => {
  useEffect(() => {
    !startPaused &&
      InteractionManager.runAfterInteractions(() => animation.start(value));
    return () => animation.stop();
  }, [startPaused, animation, value]);
  return animation;
};

/**
 * Creates a new timeline animation. A timeline animation can run multiple
 * animations with complex control over when each animation starts and stops using
 * advanced positioning and staggering options.
 * @param progress driver of the timeline animation
 * @param initializer Initialization callback for building the timeline
 * @param startPaused Whether the timeline should start paused or not. Default is false.
 * @returns
 */
export const useTimeline = (
  progress: AnimationValue,
  initializer: (tla: TimelineAnimation) => void,
  startPaused = false
) => {
  const retVal = useMemo(() => {
    return createTimeline(initializer);
  }, [initializer]);
  return useAnimation(progress, retVal, startPaused);
};

/**
 * Creates a progress animation where the provided value will be updated with
 * the progress in seconds since the animation started.
 * @param value Value to run the animation on
 * @param startPaused True if the animation should not be started immediately. Defaults to false
 * @returns An animation object
 */
export const useProgress = (value: AnimationValue, startPaused = false) => {
  const animation = useMemo(() => {
    return AnimationFactory();
  }, []);

  return useAnimation(value, animation, startPaused);
};

/**
 * Creates an interpolated animation where the provided value will be updated with
 * the interpolated value between from and to over the duration of time.
 * @param value Value to run the animation on
 * @param params Parameters for the timing animation
 * @param startPaused True if the animation should not be started immediately. Defaults to false
 * @returns An animation object
 */
export const useTiming = (
  value: AnimationValue,
  params: DurationInfoParameters & InterpolatorParams,
  startPaused?: boolean
) => {
  const animation = useMemo(() => {
    return createTiming(params);
  }, [params]);

  return useAnimation(value, animation, startPaused);
};
/**
 * Creates a spring based animation where the provided value will be updated with
 * the interpolated value between from and to over the duration of time.
 * @param value Value to run the animation on
 * @param params Configuration for the interpolation
 * @param config Configuration for the spring
 * @param startPaused True if the animation should not be started immediately. Defaults to false
 * @returns An animation object
 */
export const useSpring = (
  value: AnimationValue,
  params: number | Pick<InterpolatorParams, "from" | "to">,
  config: EasingInfo,
  startPaused?: boolean
) => {
  const animation = useMemo(() => {
    return createSpring(params, config);
  }, [params, config]);

  return useAnimation(value, animation, startPaused);
};

type LoopParams = {
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
 * Runs the given animation in a loop
 * @param value Value to run the animation on
 * @param animation
 * @param startPaused True if the animation should not be started immediately. Defaults to false
 */
export const useLoop = (
  value: AnimationValue,
  animation: BaseAnimation,
  params?: LoopParams,
  startPaused?: boolean
) => {
  const iterationsRef = useRef(0);
  const paramsResolved = useMemo(
    () => ({
      repeat: params?.repeat ?? Infinity,
      yoyo: params?.yoyo ?? false,
    }),
    [params]
  );

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
    !startPaused && startAnimation();
    return () => animation.stop();
  }, [startPaused, animation, value, startAnimation]);
  return animation;
};
