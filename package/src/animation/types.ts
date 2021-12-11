export interface AnimationValue<T = number> {
  value: T;
  startAnimation: (
    animation: (t: number) => number,
    onAnimationDone?: (animation: (t: number) => number) => void
  ) => void;
  stopAnimation: (animation: (t: number) => number) => void;
}
