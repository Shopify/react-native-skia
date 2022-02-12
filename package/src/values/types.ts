export interface IReadonlyValue<T = number> {
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

export interface IValue<T = number> extends IReadonlyValue<T> {
  /**
   * Get/sets the value hold by the Value object
   */
  value: T;
}

export interface IAnimationValue extends IReadonlyValue<number> {
  start: () => void;
  stop: () => void;
}
