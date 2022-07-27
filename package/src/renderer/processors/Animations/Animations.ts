import type { SelectorType, SkiaValue } from "../../../values";
import { mapKeys } from "../../typeddash";

export const isValue = (value: unknown): value is SkiaValue<unknown> => {
  if (value === undefined || value === null) {
    return false;
  }
  try {
    if (
      typeof value === "object" &&
      "__typename__" in value &&
      (value as unknown as SkiaValue<unknown>).__typename__ === "RNSkValue"
    ) {
      return true;
    }
  } catch {}
  return false;
};

export const isSelector = <T, R>(
  value: unknown
): value is {
  selector: (v: T) => R;
  value: SkiaValue<T>;
} => {
  if (value) {
    return (
      typeof value === "object" &&
      "selector" in value &&
      "value" in value &&
      (value as Record<string, unknown>).selector !== undefined &&
      (value as Record<string, unknown>).value !== undefined
    );
  }
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

export const materialize = <T>(props: AnimatedProps<T>) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const prop = props[key];
    if (isValue(prop)) {
      result[key] = (prop as SkiaValue<T[typeof key]>).current;
    } else if (isSelector(prop)) {
      result[key] = prop.selector(prop.value.current) as T[typeof key];
    }
  });
  return result as T;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnimatedProp<T, P = any> = T | SkiaValue<T> | SelectorType<T, P>;
export type AnimatedProps<T> = {
  [K in keyof T]: AnimatedProp<T[K]>;
};
