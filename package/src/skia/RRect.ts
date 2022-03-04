import type { SkRect } from "./Rect";

export interface SkRRect {
  readonly rect: SkRect;
  readonly rx: number;
  readonly ry: number;
}
