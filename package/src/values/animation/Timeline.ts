import type { IValue } from "../types";
import { Value } from "../Values";

import { getResolvedParams } from "./params";
import {
  addTimeline,
  createTimeline,
  getStaggeredTimeline,
  getTimeline,
  getTimelines,
  normalizeForTimeline,
} from "./timelines/functions";
import { getResolvedPosition } from "./timelines/parameters";
import type { DistributeParams, TimelineInfo } from "./timelines/types";
import type {
  AnimationControllerParams,
  AnimationParams,
  SpringConfig,
  TimingConfig,
} from "./types";
import { createTiming } from "./create";
import { Easing } from "./Easing";
import { interpolate } from "./functions";

type TimelineAnimationParams = Omit<AnimationParams, "immediate"> & {
  repeat?: number;
  repeatDelay?: number;
  label?: string;
  value?: IValue;
};

type UpdateFunction = (
  t: number,
  tli: TimelineInfo<unknown>,
  totalDuration: number
) => number | undefined;

type UpdateFunctionInfo = {
  update: UpdateFunction;
  to: number;
  from?: number;
  easing: (t: number) => number;
  value?: IValue;
};

const updateFunction: UpdateFunction = (
  t: number,
  tli: TimelineInfo<unknown>,
  totalDuration: number
) => normalizeForTimeline(t, tli, totalDuration);

type UpdateInfoTimeline = TimelineInfo<UpdateFunctionInfo>;

export type ITimelineBuilder = {
  // Returns the underlying timelineinfo object
  timelineInfo: () => UpdateInfoTimeline;
  // Adds a child timeline to the current timeline
  add: (
    toOrParams: number | TimelineAnimationParams,
    config?: TimingConfig | SpringConfig,
    position?: number | string | undefined
  ) => ITimelineBuilder;
  /**
   * Adds a list of animations to the timeline and positions them using a stagger effect
   * @param timelines Timelines to stagger
   * @param params Stagger configuration
   * @returns The timeline builder object
   */
  stagger: (
    timelines: Array<ITimelineBuilder>,
    params?: DistributeParams
  ) => ITimelineBuilder;
};

export type ITimeline = {
  // Returns the total duration of the timeline
  readonly duration: number;
  // Starts the timeline
  start: () => void;
  // Stops the timeline
  stop: () => void;
  // Contains all values of the timeline. Each timeline child
  // will be a value
  readonly values: IValue<number>[];
  // Call to clean up and destroy the timeline
  destroy: () => void;
};

/**
 * Builds a single timeline from parameters
 * @param toOrParams number for the to value or parmaters
 * @param config animation parameters
 * @param position Position
 * @returns
 */
const create = (
  toOrParams: number | TimelineAnimationParams,
  config?: TimingConfig | SpringConfig,
  position: number | string | undefined = ">"
): ITimelineBuilder => {
  return createBuilder().add(toOrParams, config, position);
};

/**
 * Creates a new Timeline-builder object. This object
 * can be used to build a new timeline object.
 * @returns A new timeline-builder object
 */
const createBuilder = (): ITimelineBuilder => {
  const root = { current: createTimeline<UpdateFunctionInfo>() };

  const add = (
    toOrParams: number | TimelineAnimationParams,
    config?: TimingConfig | SpringConfig,
    position: number | string | undefined = ">"
  ) => {
    const child = createTimelineInternal(
      root.current,
      toOrParams,
      config,
      position
    );
    const newTimeline = addTimeline(root.current, child);
    root.current = getTimeline(newTimeline);
    return {
      timelineInfo: () => root.current,
      add,
      stagger,
    };
  };

  const stagger = (
    timelineBuilders: Array<ITimelineBuilder>,
    params?: DistributeParams
  ): ITimelineBuilder => {
    const startDelay = getResolvedPosition(root.current, "<") ?? 0;
    const staggeredTimelines = getStaggeredTimeline<UpdateFunctionInfo>(
      timelineBuilders.map((tl) => tl.timelineInfo()),
      params ?? { each: 125 },
      startDelay
    );

    const newTimeline = addTimeline(root.current, ...staggeredTimelines);
    root.current = getTimeline(newTimeline);

    return {
      timelineInfo: () => root.current,
      stagger,
      add,
    };
  };

  return {
    timelineInfo: () => root.current,
    add,
    stagger,
  };
};

/**
 * Builds a new timeline from a timeline builder object
 * @param tlb Timeline builder object
 * @params params Animation controller parameters
 * @returns A new timeline object
 */
const build = (
  tlb: ITimelineBuilder,
  params?: AnimationControllerParams
): ITimeline => {
  const resolvedParams: Required<AnimationControllerParams> = {
    loop: params?.loop ?? false,
    yoyo: params?.yoyo ?? false,
    immediate: params?.immediate ?? false,
  };
  const driver = createTiming(
    { from: 0, to: 1, ...resolvedParams },
    { duration: tlb.timelineInfo()._duration, easing: Easing.linear }
  );

  // Materialize the timeline to values
  const unsubscribers: Array<() => void> = [];
  const values = getTimelines(tlb.timelineInfo())
    .filter((tli) => tli.data)
    .map((tli) => {
      let { value } = tli.data!;
      if (!value) {
        value = Value.createValue(0);
      }
      const declaredFrom = tli.data!.from;
      const previousValue: { current: undefined | number } = {
        current: undefined,
      };
      unsubscribers.push(
        driver.value.addListener((t: number) => {
          const nextValue = tli.data!.update(
            t,
            tli,
            tlb.timelineInfo()._duration
          );
          if (previousValue.current !== undefined || nextValue !== undefined) {
            if (declaredFrom === undefined && tli.data!.from === undefined) {
              tli.data!.from = value!.value;
            }
            // We got a "hit" on this timeline/value - so let's update
            const from = tli.data!.from!;
            let resolvedNextValue =
              nextValue !== undefined ? nextValue : undefined;
            if (resolvedNextValue === undefined) {
              resolvedNextValue = previousValue.current! < 0.5 ? 0 : 1;
            }
            value!.value = interpolate(
              tli.data!.easing(resolvedNextValue),
              [0, 1],
              [from, tli.data!.to]
            );
            previousValue.current = nextValue;
          } else {
            if (declaredFrom === undefined) {
              tli.data!.from = undefined;
            }
          }
        })
      );
      return value;
    });

  return {
    start: driver.start,
    stop: driver.stop,
    values,
    duration: tlb.timelineInfo().duration,
    destroy: () => {
      driver.stop();
      unsubscribers.forEach((unsub) => unsub());
    },
  };
};

/**
 * Main Timeline namespace object
 */
export const Timeline = {
  createBuilder,
  create,
  build,
};

const createTimelineInternal = (
  parent: UpdateInfoTimeline,
  toOrParams: number | TimelineAnimationParams,
  config?: TimingConfig | SpringConfig,
  position: number | string | undefined = ">"
) => {
  const resolvedParameters = getResolvedParams(toOrParams, config);
  const isNumeric = typeof toOrParams === "number";
  const startDelay = getResolvedPosition(parent, position) ?? 0;
  return createTimeline<UpdateFunctionInfo>({
    duration: resolvedParameters.duration,
    yoyo: resolvedParameters.yoyo,
    delay: startDelay,
    data: {
      update: updateFunction,
      from: isNumeric ? undefined : toOrParams.from,
      to: resolvedParameters.to,
      easing: resolvedParameters.easing,
      value: isNumeric ? undefined : toOrParams.value,
    },
    ...(!isNumeric && toOrParams.label ? { label: toOrParams.label } : {}),
    ...(!isNumeric && toOrParams.repeat ? { repeat: toOrParams.repeat } : {}),
    ...(!isNumeric && toOrParams.repeatDelay
      ? { repeatDelay: toOrParams.repeatDelay }
      : {}),
  });
};

// export const dumpTimeline = (timeline: ITimelineBuilder) => {
//   const infos = getTimelines(timeline.timelineInfo());
//   const totalDuration = timeline.timelineInfo()._duration;
//   console.log("Timeline - total duration", totalDuration.toFixed(4));
//   infos
//     .filter((f) => f.data)
//     .forEach((info, index) => {
//       console.log(`Timeline: ${index}`, info._offset, info._duration);
//     });
// };

// export const testTimeline = (t: number, timeline: ITimelineBuilder) => {
//   const infos = getTimelines(timeline.timelineInfo());
//   const totalDuration = timeline.timelineInfo()._duration;
//   console.log(
//     `Timeline (${t}) =>`,
//     (totalDuration * t).toFixed(2),
//     totalDuration.toFixed(2)
//   );
//   infos
//     .filter((f) => f.data)
//     .forEach((info, index) => {
//       console.log(
//         `Timeline: ${index}`,
//         info.data!.update(t, info, totalDuration)?.toFixed(2),
//         (t * totalDuration).toFixed(2),
//         info._offset,
//         info._duration
//       );
//     });
// };
