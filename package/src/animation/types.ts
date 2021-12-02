import type { DrawingContext } from "../renderer/DrawingContext";

import type { BaseAnimationState } from "./functions/types";

export type AnimationFunction<T = number> = (ctx: DrawingContext) => T;
export type AnimationFunctionWithState<
  S extends BaseAnimationState,
  T = number
> = (timestampSeconds: number, state: S) => T;

export interface AnimationValue<T = number> {
  value: T;
  startAnimation: (fn: AnimationFunction<T>) => void;
  endAnimation: () => void;
}

export interface Animation {
  a: number;
}
