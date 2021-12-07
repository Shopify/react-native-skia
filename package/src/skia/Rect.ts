import type { SkJSIInstance } from "./JsiInstance";

export interface JSIRect extends SkJSIInstance<"Rect"> {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  setXYWH: (x: number, y: number, width: number, height: number) => void;
  setLTRB: (left: number, top: number, right: number, bottom: number) => void;
}

export interface IRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
