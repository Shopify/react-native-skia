import type { SkiaReadonlyValue } from "../../../values";
import type { DrawingContext } from "../../DrawingContext";
import { mapKeys } from "../../typeddash";

export type FrameValue<T> = (ctx: DrawingContext) => T;
type ValueType = SkiaReadonlyValue<unknown>;

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
    if (isValue(value)) {
      return true;
    }
  }
  return false;
};

// TODO: to remove
export const processProps = <T>(props: T, cb: (value: unknown) => void) =>
  mapKeys(props).forEach((key) => {
    cb(props[key]);
  });

export const materialize = <T>(props: AnimatedProps<T>) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const value = props[key];
    if (isValue(value)) {
      result[key] = (value as SkiaReadonlyValue<T[typeof key]>).current;
    }
  });
  return result as T;
};

export type AnimatedProps<T> = {
  [K in keyof T]: T[K] | SkiaReadonlyValue<T[K]>;
};
