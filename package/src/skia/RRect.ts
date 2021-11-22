import type { SkJSIInstane } from "./JsiInstance";
import type { IRect } from "./Rect";

export interface IRRect extends SkJSIInstane<"RRect"> {
  rect: IRect;
  readonly rx: number;
  readonly ry: number;
}
