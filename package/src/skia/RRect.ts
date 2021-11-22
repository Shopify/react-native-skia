import type { SkJsiInstane } from "./JsiInstance";
import type { Rect } from "./Rect";

export interface RRect extends SkJsiInstane<"RRect"> {
  rect: Rect;
  readonly rx: number;
  readonly ry: number;
}
