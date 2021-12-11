import type { AnimationValue } from "../types";

import type {
  DurationInfoParameters,
  InterpolatorParams,
  EasingInfo,
} from "./interpolatorAnimationFactory";
import { InterpolatorAnimationFactory } from "./interpolatorAnimationFactory";
import type { TimelineAnimation } from "./timelineAnimationFactory";
import { TimelineAnimationFactory } from "./timelineAnimationFactory";
import type { BaseAnimation } from "./types";

/**
 * Creates a timeline animation object.
 * @returns
 */
export const createTimeline = (
  initializer: (tla: TimelineAnimation) => void
) => {
  const tl = TimelineAnimationFactory();
  initializer(tl);
  return tl;
};

/**
 * Creates a timing animation with the given interpolation parameters
 * @param params Configuration for the timing animation
 * @param onAnimationDone Optional callback that will be called when the animation has finished
 * @returns A timing based animation object
 */
export const createTiming = (
  params: DurationInfoParameters & Pick<InterpolatorParams, "from" | "to">,
  onAnimationDone?: () => void
) => {
  return InterpolatorAnimationFactory(params, onAnimationDone);
};

/**
 * Creates a spring animation with the given interpolation and spring parameters
 * @param params Configuration for the timing animation
 * @param config Configuration for the spring animation
 * @param onAnimationDone Optional callback that will be called when the animation has finished
 */
export const createSpring = (
  params: Pick<InterpolatorParams, "from" | "to">,
  config: EasingInfo,
  onAnimationDone?: () => void
) => {
  return InterpolatorAnimationFactory(
    { ...params, easing: config },
    onAnimationDone
  );
};

/**
 * Runs a timing animation with the given interpolation parameters
 * @param value Value to run the animation on
 * @param params Configuration for the timing animation
 * @returns A promise that is resolved when the animation has completed
 */
export const runTiming = (
  value: AnimationValue,
  params:
    | number
    | (DurationInfoParameters & Pick<InterpolatorParams, "from" | "to">)
) => {
  return new Promise<BaseAnimation>((resolve) => {
    const animation = createTiming(
      typeof params === "number" ? { to: params } : params,
      () => resolve(animation)
    );
    animation.start(value);
  });
};

/**
 * Runs a spring animation with the given interpolation and spring parameters
 * @param value Value to run the animation on
 * @param params Configuration for the interpolation
 * @param config Configuration for the spring
 * @returns A promise that is resolved when the animation has completed
 */
export const runSpring = (
  value: AnimationValue,
  params: number | Pick<InterpolatorParams, "from" | "to">,
  config: EasingInfo
) => {
  return new Promise<BaseAnimation>((resolve) => {
    const animation = createSpring(
      typeof params === "number" ? { to: params } : params,
      config,
      () => resolve(animation)
    );
    animation.start(value);
  });
};
