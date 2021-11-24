import { useCallback } from "react";

import type { DrawingContext } from "../../../DrawingContext";

export type FrameValue<T> = (ctx: DrawingContext) => T;

export const useFrame = <T>(
  cb: FrameValue<T>,
  deps?: Parameters<typeof useCallback>[1]
  // eslint-disable-next-line react-hooks/exhaustive-deps
) => useCallback(cb, deps ?? []);

const mapKeys = <T>(obj: T) => Object.keys(obj) as (keyof T)[];

export const materialize = <T>(
  ctx: DrawingContext,
  props: AnimatedProps<T>
) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const value = props[key];
    if (typeof value === "function") {
      result[key] = value(ctx);
    }
  });
  return result as T;
};

export type AnimatedProps<T> = {
  [K in keyof T]: T[K] | ((ctx: DrawingContext) => T[K]);
};
