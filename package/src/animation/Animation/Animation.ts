import { useEffect, useMemo } from "react";

import { Value } from "../Value";
import {
  addTimeline,
  createTimeline as createTimelineInternal,
  getStaggeredTimeline,
  getTimeline,
  getTimelines,
  normalizeForTimeline,
} from "../TimelineInfo/functions";
import { getResolvedPosition } from "../TimelineInfo/parameters";
import type { DistributeParams, TimelineInfo } from "../TimelineInfo/types";
import type { AnimationValue } from "../types";

type BaseAnimation = {
  start: (animationValue: AnimationValue) => void;
  stop: () => void;
  update: (timestampSeconds: number) => number;
  durationSeconds: () => number;
};

type AnimationState = {
  startTimeSeconds: number | undefined;
  currentValue: AnimationValue | undefined;
  durationSeconds: number | undefined;
};

/**
 * Creates a base animation that calls the provided update function at each step
 * @param update Update function that will be called for each step with the current timestamp in seconds
 * @param onStart Called when the animation starts
 * @param durationSeconds optional duration of the animation in seconds. If not set,
 * the duration will be calculated.
 * @returns Animation object
 */
const BaseAnimationFactory = (
  update: (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => number,
  onStart?: (animationValue: AnimationValue, state: AnimationState) => void,
  durationSeconds?: number
): BaseAnimation => {
  const state: AnimationState = {
    startTimeSeconds: undefined,
    currentValue: undefined,
    durationSeconds: durationSeconds,
  };

  const updateWrapper = (timestampSeconds: number) => {
    return update(timestampSeconds, state, stop);
  };

  /**
   * Starts the animation on the current animation value
   * @param animationValue
   */
  const start = (animationValue: AnimationValue) => {
    state.currentValue = animationValue;
    state.currentValue.startAnimation(updateWrapper);
    onStart && onStart(state.currentValue, state);
  };

  /**
   * Stops the animation
   */
  const stop = () => {
    state.currentValue?.stopAnimation(updateWrapper);
    state.currentValue = undefined;
  };

  return {
    start,
    update: updateWrapper,
    stop,
    durationSeconds: () => state.durationSeconds ?? 0,
  };
};

/**
 * Creates an animation that calls the update function
 * with the total seconds the animation has been running at each step
 * @param update Update function that will be called for each step with
 * the current runtime duration in seconds
 * @param onStart Optional callback that will be called when the animation starts
 * @param durationSeconds Optional duration of the animation in seconds. If not set,
 * this will be continuously updated
 * @returns Animation object
 */
const AnimationFactory = (
  update: (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => number = (t) => t,
  onStart?: (animationValue: AnimationValue, state: AnimationState) => void,
  durationSeconds?: number
): BaseAnimation => {
  /**
   * @param timestampSeconds Current timestamp
   * @returns the current runtime in seconds from start
   */
  const updateWrapper = (
    timestampSeconds: number,
    state: AnimationState,
    stop: () => void
  ) => {
    if (state.startTimeSeconds === undefined) {
      state.startTimeSeconds = timestampSeconds;
      state.durationSeconds = 0;
      return 0;
    }
    state.durationSeconds =
      durationSeconds ?? timestampSeconds - state.startTimeSeconds;
    return update(timestampSeconds - state.startTimeSeconds, state, stop);
  };

  return BaseAnimationFactory(updateWrapper, onStart, durationSeconds);
};

type EasingInfo = {
  update: (t: number) => number;
  durationSeconds: number;
};

type EasingInfoParameters = {
  /**
   * Easing info object that contains duration and an easing function. Defaults to a linear easing
   */
  easing?: EasingInfo;
};

type DurationInfoParameters = {
  /**
   * The duration of the animation in seconds. Defaults to 1000
   */
  durationSeconds?: number;
  /**
   * Easing function that will be applied to the animation. Defaults to linear
   */
  easing?: (t: number) => number;
};

type InterpolatorParams = {
  /**
   * The start value of the animation. Defaults to 0
   */
  from?: number;
  /**
   * The end value of the animation. Defaults to 1
   */
  to?: number;
  /**
   * Set to true to repeat the animation indefinitely
   */
  repeat?: boolean;
  /**
   * If the animation is a repeated animation, setting yoyo to true will reverse the animation
   * on every odd iteration
   */
  yoyo?: boolean;
};

type InterpolatorFactoryParams = InterpolatorParams &
  (EasingInfoParameters | DurationInfoParameters);

const DefaultParams = {
  from: 0,
  to: 1,
  durationSeconds: 1,
  easing: (t: number) => t,
  repeat: false,
  yoyo: false,
};

/**
 * Creates an animation that interpolates between two values over a duration of time in seconds
 * @param params Configuration of the interpolation
 * @param onAnimationDone Optional callback that will be called when the animation has reaced its duration
 * @returns Animation object
 */
const InterpolatorAnimationFactory = (
  params: InterpolatorFactoryParams = DefaultParams,
  onAnimationDone?: () => void
): BaseAnimation => {
  const from = params.from ?? DefaultParams.from;
  const to = params.to ?? DefaultParams.to;
  let easing: EasingInfo | ((t: number) => number) =
    params.easing ?? DefaultParams.easing;
  let durationSeconds: number;

  // Resolve easing from easing or easing information
  if ("durationSeconds" in easing) {
    // eslint-disable-next-line prefer-destructuring
    durationSeconds = easing.durationSeconds;
    easing = easing.update;
  } else {
    durationSeconds =
      "durationSeconds" in params
        ? params.durationSeconds ?? DefaultParams.durationSeconds
        : DefaultParams.durationSeconds;
  }

  const config = {
    from,
    to,
    durationSeconds,
    easing,
    repeat: params?.repeat ?? DefaultParams.repeat,
    yoyo: params?.yoyo ?? DefaultParams.yoyo,
  };

  // Handle setting the from parameter to the start value of the animation
  // if from is not set
  const handleStart = (animationValue: AnimationValue) => {
    if (params?.from === undefined) {
      config.from = animationValue.value;
    }
  };

  /**
   * @param timestampSeconds Current timestamp
   * @returns the interpolate value between from and to over the duration of time
   */
  const update = (
    timestampSeconds: number,
    _: AnimationState,
    stop: () => void
  ) => {
    // Repeat / clamping
    const progress = config.easing(
      config.repeat
        ? (timestampSeconds / config.durationSeconds) % 1
        : Math.max(
            0.0,
            Math.min(timestampSeconds / config.durationSeconds, 1.0)
          )
    );
    // Yoyo / reversing
    const progressWithYoyo =
      config.yoyo && (timestampSeconds / config.durationSeconds) % 2 > 1
        ? 1 - progress
        : progress;
    // Stop?
    if (!config.repeat && timestampSeconds / config.durationSeconds >= 1) {
      stop();
      onAnimationDone && onAnimationDone();
    }
    // Interpolate
    return config.from + (config.to - config.from) * progressWithYoyo;
  };

  return AnimationFactory(update, handleStart, config.durationSeconds);
};

type AnimationWithValue = {
  animation: BaseAnimation;
  value: AnimationValue;
};
type AnimatedTimelineInfo = TimelineInfo<AnimationWithValue>;

type TimelineStateUpdateValueInfo = {
  value: AnimationValue;
  updater: (t: number) => number;
};

type TimelineState = {
  timeline: AnimatedTimelineInfo;
  children: AnimatedTimelineInfo[];
  updateValueInfos: TimelineStateUpdateValueInfo[];
};

type TimelineAnimation = BaseAnimation & {
  add: (
    animation: BaseAnimation,
    value?: AnimationValue,
    position?: string | number | undefined
  ) => AnimationValue;
  stagger: (
    animations: BaseAnimation[],
    values?: AnimationValue[],
    params?: DistributeParams<AnimationWithValue>
  ) => AnimationValue[];
};

/**
 * Creates a new timeline animation factory. This factory can be used to build
 * timelines of animations. The timeline will interpolate all its inner timeline elements
 * and animate their values over time.
 * @returns Timeline object
 */
const TimelineAnimationFactory = (): TimelineAnimation => {
  const state: TimelineState = {
    timeline: createTimelineInternal(),
    children: [],
    updateValueInfos: [],
  };

  // Parent "driver" animation. Simple progress animation
  const driverAnimation = AnimationFactory(
    (t) => t,
    () => {
      console.log("Starting timeline");
      dumpTimeline(state.timeline);
      // Now we need to start all child values so that the view / value knows
      // that they're part of an animation. We should create a unique set of
      // values and only start one animation on each of them
      state.updateValueInfos.forEach((uvi) => {
        uvi.value.startAnimation(uvi.updater);
      });
    }
  );

  /**
   * Helper for creating a new timeline item with the correct animation
   */
  const createAnimatedTimeline = (
    startDelay: number,
    animation: BaseAnimation,
    value?: AnimationValue
  ): AnimatedTimelineInfo => {
    const childTimeline = createTimelineInternal({
      data: { animation, value: value ?? Value.create(0) },
      duration: animation.durationSeconds() * 1000, // timelines are in milliseconds
      delay: startDelay,
    });
    return childTimeline;
  };

  const updateFromTimeline = (
    progressSeconds: number,
    tli: AnimatedTimelineInfo
  ) => {
    // Now we have the active timeline for this value - normalize
    // the progress to the timeline:
    const v = normalizeForTimeline(
      progressSeconds,
      tli,
      state.timeline._duration
    );

    // Call the original animation update function with the normalized progress
    return tli.data!.animation.update(v * (tli._duration / 1000));
  };

  const updateState = (...timelines: AnimatedTimelineInfo[]) => {
    const newTimeline = addTimeline(state.timeline, ...timelines);
    state.timeline = getTimeline(newTimeline);
    state.children = getTimelines(state.timeline).filter((tl) => tl.data);

    // Now we'll create a list of unique values from the resulting timelines.
    // This list will be used to start animations on the values.
    // We'll also use this list to create an animation update function that
    // can be set on each value and used for updating.
    state.updateValueInfos = state.children.reduce((acc, child) => {
      if (acc.find((p) => p.value === child.data!.value) === undefined) {
        const valueTimelines = state.children.filter(
          (tl) => tl.data!.value === child.data!.value
        );
        return acc.concat([
          ...acc,
          {
            value: child.data!.value,
            updater: (progressSeconds: number) => {
              const runtimeSeconds =
                driverAnimation.update(progressSeconds) * 1000; // Convert to milliseconds

              // Find the active timeline from the offset and current timeline point
              if (valueTimelines.length === 1) {
                return updateFromTimeline(runtimeSeconds, valueTimelines[0]);
              }
              for (let i = valueTimelines.length - 1; i >= 0; i--) {
                if (runtimeSeconds >= valueTimelines[i]._offset) {
                  return updateFromTimeline(runtimeSeconds, valueTimelines[i]);
                }
              }
              // We didn't find an active timeline so we'll just return the first
              // timeline's 1.0 value
              return child.data!.value.value;
            },
          },
        ]);
      }
      return acc;
    }, [] as Array<TimelineStateUpdateValueInfo>);
    return newTimeline;
  };

  /**
   * Adds a new animation to the timeline
   * @param animation Animation to add to the timeline
   * @param value Optional value to run the animation on
   * @returns Animation value that can be used to set the value of the animation
   */
  const add = (
    animation: BaseAnimation,
    value?: AnimationValue,
    position: string | number | undefined = "<"
  ) => {
    const startDelay = getResolvedPosition(state.timeline, position) ?? 0;
    const childTimeline = createAnimatedTimeline(startDelay, animation, value);
    updateState(childTimeline);
    return childTimeline.data!.value;
  };

  /**
   * Adds a list of animations to the timeline and positions them using a stagger effect
   * @param animations Animations to add
   * @param values Optional values to run the animations on
   * @param params Stagger configuration
   * @returns An array of values that can be used to set the values of the animations
   */
  const stagger = (
    animations: BaseAnimation[],
    values?: AnimationValue[],
    params?: DistributeParams<AnimationWithValue>
  ) => {
    if (values !== undefined && animations.length !== values?.length) {
      throw Error("Number of animations and values must match");
    }
    const startDelay = getResolvedPosition(state.timeline, "<") ?? 0;
    const childTimelines = animations.map((animation, index) =>
      createAnimatedTimeline(
        startDelay,
        animation,
        values ? values[index] : Value.create(0)
      )
    );
    // calculate staggerd starting points
    const staggeredTimelines = getStaggeredTimeline<AnimationWithValue>(
      childTimelines,
      params ?? { each: 125 },
      startDelay
    );

    // Update state
    updateState(...staggeredTimelines);

    // Return values
    return childTimelines.map((tl) => tl.data!.value);
  };

  return {
    ...driverAnimation,
    add,
    stagger,
  };
};

/**
 * Creates a timeline animation object.
 * @returns
 */
export const createTimeline = () => {
  return TimelineAnimationFactory();
};

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
  params: DurationInfoParameters & Pick<InterpolatorParams, "from" | "to">
) => {
  return new Promise<BaseAnimation>((resolve) => {
    const animation = createTiming(params, () => resolve(animation));
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
  params: Pick<InterpolatorParams, "from" | "to">,
  config: EasingInfo
) => {
  return new Promise<BaseAnimation>((resolve) => {
    const animation = createSpring(params, config, () => resolve(animation));
    animation.start(value);
  });
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

export const dumpTimeline = <T>(root: TimelineInfo<T>) => {
  const infos = getTimelines(root);
  console.log("Timeline - total duration", root._duration);
  infos
    .filter((f) => f.data)
    .forEach((info, index) => {
      console.log(`Timeline: ${index}`, info._offset, info._duration);
    });
};
