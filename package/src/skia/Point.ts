import type { SkJSIInstane } from "./JsiInstance";

export enum PointMode {
  Points,
  Lines,
  Polygon,
}

export interface IPoint extends SkJSIInstane<"Point"> {
  readonly x: number;
  readonly y: number;
}
