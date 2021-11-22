import type { SkJsiInstane } from "./JsiInstance";
import type { IRect } from "./Rect";

export interface RRect extends SkJsiInstane<"RRect"> {
  rect: IRect;
  readonly rx: number;
  readonly ry: number;
}
