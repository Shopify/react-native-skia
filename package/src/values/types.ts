export interface IReadonlyValue<T = number> {
  /**
   * Gets the value hold by the Value object
   */
  readonly value: T;
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

type RV<T> = IReadonlyValue<T>;
export type CreateDerivedValue = {
  <R, T1>(cb: (...v: [T1]) => R, deps: [RV<T1>]): RV<R>;
  <R, T1, T2>(cb: (...v: [T1, T2]) => R, deps: [RV<T1>, RV<T2>]): RV<R>;
  <R, T1, T2, T3>(
    cb: (...v: [T1, T2, T3]) => R,
    deps: [RV<T1>, RV<T2>, RV<T3>]
  ): RV<R>;
  <R, T1, T2, T3, T4>(
    cb: (...v: [T1, T2, T3, T4]) => R,
    deps: [RV<T1>, RV<T2>, RV<T3>, RV<T4>]
  ): RV<R>;
  <R, T1, T2, T3, T4, T5>(
    cb: (...v: [T1, T2, T3, T4, T5]) => R,
    deps: [RV<T1>, RV<T2>, RV<T3>, RV<T4>, RV<T5>]
  ): RV<R>;
  <R, T1, T2, T3, T4, T5, T6>(
    cb: (...v: [T1, T2, T3, T4, T5, T6]) => R,
    deps: [RV<T1>, RV<T2>, RV<T3>, RV<T4>, RV<T5>, RV<T6>]
  ): RV<R>;
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
   */
  createAnimationValue: () => IAnimationValue;
}

declare global {
  var SkiaValueApi: ISkiaValueApi;
}
