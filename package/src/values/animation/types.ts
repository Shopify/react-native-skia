import type { IValue } from "../types";

export interface SpringConfig {
  duration: number;
  update: (t: number) => number;
}

export interface TimingConfig {
  duration: number;
  easing?: (t: number) => number;
}

export interface AnimationControllerParams {
  loop?: boolean;
  yoyo?: boolean;
  immediate?: boolean;
}

export interface AnimationValueParams {
  from?: number;
  to?: number;
}

export interface AnimationParams
  extends AnimationControllerParams,
    AnimationValueParams {}

export interface IAnimation {
  value: IValue;
  start: () => void;
  stop: () => void;
}
