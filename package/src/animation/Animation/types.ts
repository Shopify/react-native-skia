import type { AnimationValue } from "../types";

export type BaseAnimation = {
  start: (animationValue: AnimationValue) => Promise<void>;
  reverse: (animationValue: AnimationValue) => Promise<void>;
  stop: () => void;
  update: (timestampSeconds: number) => number;
  duration: () => number;
};

export type AnimationState = {
  startTime: number | undefined;
  currentValue: AnimationValue | undefined;
  duration: number | undefined;
  reverse: boolean;
  onAnimationDone: (() => void) | undefined;
};
