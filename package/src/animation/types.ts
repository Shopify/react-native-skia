export interface ReadonlyAnimationValue<T = number> {
  readonly value: T;
  startAnimation: (
    animation: (t: number) => number,
    onAnimationDone?: (animation: (t: number) => number) => void
  ) => void;
  stopAnimation: (animation: (t: number) => number) => void;
  addListener(listener: (v: T) => void): () => void;
  __typename__: "AnimationValue";
}
export interface AnimationValue<T = number> extends ReadonlyAnimationValue<T> {
  value: T;
}
