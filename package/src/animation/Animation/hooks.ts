import { useEffect, useMemo } from "react";

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

/**
 * Creates a new timeline animation.
 * @param progress Driver of the timeline animation
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
    const tl = createTimeline();
    initializer(tl);
    return tl;
  }, [initializer]);
  return useAnimation(progress, retVal, startPaused);
};

const useAnimation = (
  value: AnimationValue,
  animation: BaseAnimation,
  startPaused?: boolean
) => {
  useEffect(() => {
    !startPaused && animation.start(value);
    return () => animation.stop();
  }, [startPaused, animation, value]);
  return animation;
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
  params: InterpolatorParams,
  config: EasingInfo,
  startPaused?: boolean
) => {
  const animation = useMemo(() => {
    return createSpring(params, config);
  }, [params, config]);

  return useAnimation(value, animation, startPaused);
};

export const useLoop = (animation: BaseAnimation, startPaused?: boolean) => {};
