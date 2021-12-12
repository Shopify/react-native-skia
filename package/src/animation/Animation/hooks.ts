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
 * Creates a progress animation where the provided value will be updated with
 * the progress in seconds since the animation started.
 * @returns An animation value that will be updated by the animation
 */
export const useProgress = (): AnimationValue => {
  const animation = useMemo(() => {
    return AnimationFactory();
  }, []);

  return useAnimation(animation);
};

/**
 * Creates an interpolated animation where the provided value will be updated with
 * the interpolated value between from and to over the duration of time.
 * @param params Parameters for the timing animation
 * @returns An animation value that will be updated by the animation
 */
export const useTiming = (
  params: DurationInfoParameters & InterpolatorParams
) => {
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
 * @param animation
 * @returns An animation value that will be updated by the animation
 */
export const useLoop = (animation: BaseAnimation, params?: LoopParams) => {
  const iterationsRef = useRef(0);
  const paramsResolved = useMemo(
    () => ({
      repeat: params?.repeat ?? Infinity,
      yoyo: params?.yoyo ?? false,
    }),
    [params]
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
