export interface SkiaReadonlyValue<T = number> {
  /**
   * Gets the value hold by the Value object
   */
  readonly value: T;
  /**
   * Adds a listener that is called when value changes.
   * Returns unsubscribe method.
   */
  addListener: (cb: (value: T) => void) => () => void;
  /**
   * Field to make typechecking easier
   */
  __typename__: "RNSkValue";
}

export interface SkiaValue<T = number> extends SkiaReadonlyValue<T> {
  /**
   * Get/sets the value hold by the Value object
   */
  value: T;
  /**
   * Get/sets the animation controlling the value
   * */
  animation: SkiaAnimation | undefined;
}

export interface SkiaClockValue extends SkiaReadonlyValue<number> {
  start: () => void;
  stop: () => void;
}

export interface SkiaAnimation {
  cancel: () => void;
}

export interface AnimationState {
  current: number;
  finished: boolean;
}
