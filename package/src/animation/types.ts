import type { AnimationState } from "./functions/types";

export type AnimationFunction = (timestampSeconds: number) => number;
export type AnimationFunctionWithState = (
  timestampSeconds: number,
  state: AnimationState
) => number;

export type AnimationStateFactory = (currentValue: number) => AnimationState;

export interface AnimationValue<T = number> {
  value: T;
  startAnimation: (
    animation: Animation,
    onAnimationDone?: (animation: Animation) => void
  ) => void;
  stopAnimation: (animation: Animation) => void;
}

export interface Animation {
  _begin: (start: number) => Animation;
  evaluate: AnimationFunction;
  start: (value?: AnimationValue) => Promise<Animation>;
  stop: () => void;
  active: () => boolean;
  readonly duration: number;
}

export interface TimelineAnimation extends Animation {
  readonly values: AnimationValue[];
  start: () => Promise<TimelineAnimation>;
}
