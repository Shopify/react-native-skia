import { Extrapolate } from "../animation/interpolator/types";
import { EasingConfig } from "../animation/timing/Easing";
import { AnimationCallback, SpringConfig } from "../animation/types";

export interface SkiaValue<T = number> {
  /**
   * Gets the value hold by the Value object
   */
  readonly current: T;
  /**
   * Adds a listener that is called when value changes.
   * Returns unsubscribe method.
   */
  addListener: (cb: (value: T) => void) => () => void;
  /**
   * Invalidates the value. Has different meaning depending on the type of the value.
   */
  __invalidate: () => void;
  /**
   * Field to make typechecking easier
   */
  __typename__: "RNSkValue";
}

export interface SkiaMutableValue<T = number> extends SkiaValue<T> {
  /**
   * Get/sets the value hold by the Value object
   */
  current: T;
  /**
   * Get/sets the animation controlling the value. The animation
   * can be any Skia Value - meaning that it is possible to chain
   * Skia values together and create complex animations.
   * */
  animation: SkiaValue<number> | undefined;
}

export interface SkiaClockValue extends SkiaValue<number> {
  start: () => void;
  stop: () => void;
}

export interface SkiaAnimation extends SkiaClockValue {
  cancel: () => void;
}

export interface AnimationState {
  current: number;
  finished: boolean;
}

export interface ISkiaValueApi {
  /**
   * Creates a new value that holds the initial value and that
   * can be changed.
   */
  createValue: <T>(initialValue: T) => SkiaMutableValue<T>;

  /**
   * Creates a computed value. This is a calculated value that returns the result of
   * a function that is called with the values of the dependencies.
   */
  createComputedValue: <R>(
    cb: () => R,
    values: Array<SkiaValue<unknown>>
  ) => SkiaValue<R>;
  /**
   * Creates a clock value where the value is the number of milliseconds elapsed
   * since the clock was created
   */
  createClockValue: () => SkiaClockValue;

  /**
   * Creates a spring easing interpolator.
   * @returns Skia Value
   */
  createSpringEasing: (config: SpringConfig) => {
    duration: number;
    easing: SkiaMutableValue;
  };

  /**
   * Creates an Easing value
   * @param type Type of easing
   * @returns Skia Value that will interpolate between 0..1 using the provided easing
   */
  createEasing: (type: EasingConfig) => SkiaMutableValue;

  /**
   * Creates a timing value
   * @param resolvedParams
   * @param easingValue Easing value. Optional
   * @param callback Called when timing is. Optional
   * @returns Timing based animation value
   */
  createTiming: (
    resolvedParams: {
      from: number;
      to: number;
      loop: boolean;
      yoyo: boolean;
      duration: number;
    },
    easing: SkiaMutableValue | null | undefined,
    callback?: AnimationCallback
  ) => SkiaAnimation;

  /**
   * Creates an interpolator value that can interpolate between a set of values like
   * numbers, colors, transforms, matrices, paths, rects, rrects and points.
   * @param config
   * @returns Interpolating Skia value.
   */
  createInterpolator: <T>(config: {
    inputs: Array<number>;
    outputs: Array<T>;
    extrapolateLeft: Extrapolate;
    extrapolateRight: Extrapolate;
  }) => SkiaMutableValue<T>;
}
