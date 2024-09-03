export enum PointMode {
  Points,
  Lines,
  Polygon,
}

export interface SkPoint {
  readonly x: number;
  readonly y: number;
}

export type Vector = SkPoint;
