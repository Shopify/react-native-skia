import type { DrawingContext } from "../../DrawingContext";

export type AnimatedProps<T> = T & {
  animatedProps: (ctx: DrawingContext) => Partial<T>;
};
