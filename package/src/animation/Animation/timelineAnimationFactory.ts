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

import { AnimationFactory } from "./animationFactory";
import type { BaseAnimation } from "./types";

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

type PositionParam = number | string;
type TimelineConfig = Partial<
  Pick<AnimatedTimelineInfo, "delay" | "repeat" | "repeatDelay" | "yoyo">
>;

export type TimelineAnimation = BaseAnimation & {
  add: (
    animation: BaseAnimation,
    value?: AnimationValue,
    timelineConfig?: TimelineConfig,
    positionOrParams?: PositionParam | undefined
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
export const TimelineAnimationFactory = (): TimelineAnimation => {
  const state: TimelineState = {
    timeline: createTimelineInternal(),
    children: [],
    updateValueInfos: [],
  };

  // Parent "driver" animation. Simple progress animation
  const driverAnimation = AnimationFactory(
    (t, _, stop) => {
      if (t > state.timeline._duration / 1000) {
        stop();
      }
      return t;
    },
    () => {
      // dumpTimeline(state.timeline);
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
    value?: AnimationValue,
    timelineConfig: TimelineConfig = {}
  ): AnimatedTimelineInfo => {
    const childTimeline = createTimelineInternal({
      ...timelineConfig,
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
    timelineConfig?: TimelineConfig,
    position: string | number | undefined = "<"
  ) => {
    const startDelay = getResolvedPosition(state.timeline, position) ?? 0;
    const childTimeline = createAnimatedTimeline(
      startDelay,
      animation,
      value,
      timelineConfig
    );
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

export const dumpTimeline = <T>(root: TimelineInfo<T>) => {
  const infos = getTimelines(root);
  console.log("Timeline - total duration", root._duration);
  infos
    .filter((f) => f.data)
    .forEach((info, index) => {
      console.log(`Timeline: ${index}`, info._offset, info._duration);
    });
};
