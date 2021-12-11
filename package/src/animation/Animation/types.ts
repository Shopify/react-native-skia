import type { AnimationValue } from "../types";

export type BaseAnimation = {
  start: (animationValue: AnimationValue) => void;
  stop: () => void;
  update: (timestampSeconds: number) => number;
  durationSeconds: () => number;
};

export type AnimationState = {
  startTimeSeconds: number | undefined;
  currentValue: AnimationValue | undefined;
  durationSeconds: number | undefined;
};
