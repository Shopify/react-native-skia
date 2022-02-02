import type { DrawingContext } from "../../DrawingContext";
import { mapKeys } from "../../typeddash";

export type FrameValue<T> = (ctx: DrawingContext) => T;

// TODO: refine detection here. Is the prototype accepting a drawing ctx for instance?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAnimatedValue = (value: unknown): value is FrameValue<any> =>
  typeof value === "function";

export const isAnimated = <T>(props: AnimatedProps<T>) => {
  for (const value of Object.values(props)) {
    if (isAnimatedValue(value)) {
      return true;
    }
  }
  return false;
};

export const materialize = <T>(
  ctx: DrawingContext,
  props: AnimatedProps<T>
) => {
  const result = { ...props };
  mapKeys(props).forEach((key) => {
    const value = props[key];
    if (isAnimatedValue(value)) {
      result[key] = value(ctx);
    }
  });
  return result as T;
};

export type AnimatedProps<T> = {
  [K in keyof T]: T[K] | ((ctx: DrawingContext) => T[K]);
};
