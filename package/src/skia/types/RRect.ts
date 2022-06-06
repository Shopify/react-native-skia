import type { SkRect } from "./Rect";

export interface SkRRect {
  readonly rect: SkRect;
  readonly rx: number;
  readonly ry: number;
}

// We have an issue to check property existence on JSI backed instances
export const isRRect = (def: SkRect | SkRRect): def is SkRRect =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (def as any).rect !== undefined;
