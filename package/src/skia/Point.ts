import type { SkJsiInstane } from "./JsiInstance";
export enum PointMode {
  Points,
  Lines,
  Polygon,
}

export interface Point extends SkJsiInstane<"Point"> {
  readonly x: number;
  readonly y: number;
}
