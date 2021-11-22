import type { SkJsiInstane } from "./JsiInstance";

export interface IRect extends SkJsiInstane<"Rect"> {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  setXYWH: (x: number, y: number, width: number, height: number) => void;
  setLTRB: (left: number, top: number, right: number, bottom: number) => void;
}
