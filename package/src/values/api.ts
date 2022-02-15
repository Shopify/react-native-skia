import type { ClockValue, ReadonlyValue, Value } from "./types";

export type CreateDerivedValue = {
  <R, T1>(cb: (...v: [T1]) => R, deps: [ReadonlyValue<T1>]): ReadonlyValue<R>;
  <R, T1, T2>(
    cb: (...v: [T1, T2]) => R,
    deps: [ReadonlyValue<T1>, ReadonlyValue<T2>]
  ): ReadonlyValue<R>;
  <R, T1, T2, T3>(
    cb: (...v: [T1, T2, T3]) => R,
    deps: [ReadonlyValue<T1>, ReadonlyValue<T2>, ReadonlyValue<T3>]
  ): ReadonlyValue<R>;
  <R, T1, T2, T3, T4>(
    cb: (...v: [T1, T2, T3, T4]) => R,
    deps: [
      ReadonlyValue<T1>,
      ReadonlyValue<T2>,
      ReadonlyValue<T3>,
      ReadonlyValue<T4>
    ]
  ): ReadonlyValue<R>;
  <R, T1, T2, T3, T4, T5>(
    cb: (...v: [T1, T2, T3, T4, T5]) => R,
    deps: [
      ReadonlyValue<T1>,
      ReadonlyValue<T2>,
      ReadonlyValue<T3>,
      ReadonlyValue<T4>,
      ReadonlyValue<T5>
    ]
  ): ReadonlyValue<R>;
  <R, T1, T2, T3, T4, T5, T6>(
    cb: (...v: [T1, T2, T3, T4, T5, T6]) => R,
    deps: [
      ReadonlyValue<T1>,
      ReadonlyValue<T2>,
      ReadonlyValue<T3>,
      ReadonlyValue<T4>,
      ReadonlyValue<T5>,
      ReadonlyValue<T6>
    ]
  ): ReadonlyValue<R>;
  <R>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (...args: Array<any>) => R,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: Array<ReadonlyValue<any>>
  ): ReadonlyValue<R>;
};

export interface ISkiaValueApi {
  /**
   * Creates a new value that holds the initial value and that
   * can be changed.
   */
  createValue: <T>(initialValue: T) => Value<T>;
  /**
   * Creates a derived value. This is a calculated value that returns the result of
   * a function that is called with the values of the dependencies.
   */
  createDerivedValue: CreateDerivedValue;
  /**
   * Creates a value that will update its value every frame redraw with
   * the current number of milliseconds since it was started.
   * @param immediate If true, the value start running immediately
   */
  createClockValue: (immediate?: boolean) => ClockValue;
}

declare global {
  var SkiaValueApi: ISkiaValueApi;
}

export const ValueApi: ISkiaValueApi = {
  createValue: global.SkiaValueApi.createValue,
  createDerivedValue: global.SkiaValueApi.createDerivedValue,
  createClockValue: global.SkiaValueApi.createClockValue,
};
