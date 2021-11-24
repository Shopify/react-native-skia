import { useCallback } from "react";

import type { DrawingContext } from "../../../DrawingContext";

import type { EasingFunction } from "./Easing";

export type FrameCallback<T> = (ctx: DrawingContext) => T;

export const useFrame = <T>(
  cb: FrameCallback<T>,
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

interface TimingConfig {
  from?: number;
  to?: number;
  duration?: number;
  easing?: EasingFunction;
}

export const useLoop = (
  config: TimingConfig,
  boomerang = true,
  deps?: Parameters<typeof useFrame>[1]
) =>
  useFrame((ctx) => {
    const timestamp = ctx.timestamp * 1000;
    const duration = config.duration ?? 1000;
    const progress = normalize(timestamp, duration);
    const currentIteration = Math.floor(timestamp / duration);
    const isGoingBack = currentIteration % 2 === 0;
    return isGoingBack && boomerang ? 1 - progress : progress;
  }, deps ?? []);

const normalize = (timestamp: number, duration: number) =>
  (timestamp / duration / 1) % 1;
