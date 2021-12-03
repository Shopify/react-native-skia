import type { BaseAnimationState } from "./functions/types";

export type AnimationFunction = (timestampSeconds: number) => number;
export type AnimationFunctionWithState = (
  timestampSeconds: number,
  state: BaseAnimationState
) => number;

export interface AnimationValue<T = number> {
  value: T;
  startAnimation: (fn: AnimationFunction, onAnimationDone?: () => void) => void;
  endAnimation: (fn: AnimationFunction) => void;
}

export interface Animation {
  readonly value: AnimationValue<number>;
  readonly state: BaseAnimationState | undefined;
  start: () => Promise<Animation>;
  reverse: () => Promise<Animation>;
  stop: () => void;
  reset: () => void;
}
