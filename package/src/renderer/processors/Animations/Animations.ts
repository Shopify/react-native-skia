import type { ReadonlyValue } from "../../../values";
import type { DrawingContext } from "../../DrawingContext";
import { mapKeys } from "../../typeddash";

export type FrameValue<T> = (ctx: DrawingContext) => T;
type ValueType = ReadonlyValue<unknown>;

// TODO: refine detection here. Is the prototype accepting a drawing ctx for instance?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isPropCallback = (value: unknown): value is FrameValue<any> =>
  typeof value === "function";

export const isValue = (value: unknown): value is ValueType => {
  if (value === undefined || value === null) {
    return false;
  }
  try {
    if (
      typeof value === "object" &&
      "__typename__" in value &&
      (value as unknown as ValueType).__typename__ === "RNSkValue"
    ) {
      return true;
    }
  } catch {}
  return false;
};

export const isAnimated = <T>(props: AnimatedProps<T>) => {
  for (const value of Object.values(props)) {
    if (isPropCallback(value)) {
      return true;
    } else if (isValue(value)) {
      return true;
    }
  }
  return false;
};

export const processProps = <T>(props: T, cb: (value: unknown) => void) =>
  mapKeys(props).forEach((key) => cb(props[key]));

export const materialize = <T>(
  ctx: DrawingContext,
  props: AnimatedProps<T>
) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const value = props[key];
    if (isPropCallback(value)) {
      result[key] = value(ctx);
    } else if (isValue(value)) {
      result[key] = (value as unknown as ReadonlyValue<T[typeof key]>).value;
    }
  });
  return result as T;
};

export type AnimatedProps<T> = {
  [K in keyof T]: T[K] | ((ctx: DrawingContext) => T[K]) | ReadonlyValue<T[K]>;
};
