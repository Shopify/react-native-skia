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
  /**
   * Adds another value as the driver of this value. When the driver
   * value change, this value will be updated with either the value of the
   * dependant value, or if the cb parameter is provided, the result of the
   * callback. To remove a dependency, just call addDependency with an undefined
   * value.
   */
  setDriver: <DepT>(
    value: IReadonlyValue<DepT> | undefined,
    cb?: (v: DepT) => T
  ) => void;
  /**
   * Returns the current dependency of this value.
   */
  getDriver: () => IReadonlyValue<T> | undefined;
}

export interface IAnimationValue extends IReadonlyValue<number> {
  start: () => void;
  stop: () => void;
}

export type CreateDerivedValue = {
  <R, T1>(cb: (...v: [T1]) => R, deps: [IReadonlyValue<T1>]): IReadonlyValue<R>;
  <R, T1, T2>(
    cb: (...v: [T1, T2]) => R,
    deps: [IReadonlyValue<T1>, IReadonlyValue<T2>]
  ): IReadonlyValue<R>;
  <R, T1, T2, T3>(
    cb: (...v: [T1, T2, T3]) => R,
    deps: [IReadonlyValue<T1>, IReadonlyValue<T2>, IReadonlyValue<T3>]
  ): IReadonlyValue<R>;
  <R, T1, T2, T3, T4>(
    cb: (...v: [T1, T2, T3, T4]) => R,
    deps: [
      IReadonlyValue<T1>,
      IReadonlyValue<T2>,
      IReadonlyValue<T3>,
      IReadonlyValue<T4>
    ]
  ): IReadonlyValue<R>;
  <R, T1, T2, T3, T4, T5>(
    cb: (...v: [T1, T2, T3, T4, T5]) => R,
    deps: [
      IReadonlyValue<T1>,
      IReadonlyValue<T2>,
      IReadonlyValue<T3>,
      IReadonlyValue<T4>,
      IReadonlyValue<T5>
    ]
  ): IReadonlyValue<R>;
  <R, T1, T2, T3, T4, T5, T6>(
    cb: (...v: [T1, T2, T3, T4, T5, T6]) => R,
    deps: [
      IReadonlyValue<T1>,
      IReadonlyValue<T2>,
      IReadonlyValue<T3>,
      IReadonlyValue<T4>,
      IReadonlyValue<T5>,
      IReadonlyValue<T6>
    ]
  ): IReadonlyValue<R>;
  <R>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (...args: Array<any>) => R,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Array<IReadonlyValue<any>>
  ): IReadonlyValue<R>;
};

export interface ISkiaValueApi {
  /**
   * Creates a new value that holds the initial value and that
   * can be changed.
   */
  createValue: <T>(initialValue: T) => IValue<T>;
  /**
   * Creates a derived value. This is a calculated value that returns the result of
   * a function that is called with the values of the dependencies.
   */
  createDerivedValue: CreateDerivedValue;
  /**
   * Creates an animated value that will update its value every frame redraw with
   * the current number of milliseconds since it was started.
   * @param immediate If true, the value start running immediately
   */
  createAnimationValue: (immediate?: boolean) => IAnimationValue;
}

declare global {
  var SkiaValueApi: ISkiaValueApi;
}
