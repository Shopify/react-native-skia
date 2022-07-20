import type { SkiaValue } from "../../../values";
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

export const isIndexedAccess = (
  value: unknown
): value is { index: number; value: SkiaValue<Array<unknown>> } => {
  if (value) {
    return (
      typeof value === "object" &&
      "index" in value &&
      "value" in value &&
      (value as Record<string, unknown>).index !== undefined &&
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
    const value = props[key];
    if (isValue(value)) {
      result[key] = (value as SkiaValue<T[typeof key]>).current;
    } else if (isIndexedAccess(value)) {
      result[key] = value.value.current[value.index] as T[typeof key];
    }
  });
  return result as T;
};

export type AnimatedProps<T> = {
  [K in keyof T]:
    | T[K]
    | SkiaValue<T[K]>
    | { index: number; value: SkiaValue<Array<T[K]>> };
};
