import type { SkJSIInstance } from "./JsiInstance";
import type { SkCanvas } from "./Canvas";
import type { Transforms3d } from "./Matrix4";
import { processTransform3d } from "./Matrix4";

export const isMatrix = (obj: unknown): obj is SkMatrix =>
  obj !== null && (obj as SkJSIInstance<string>).__typename__ === "Matrix";

export interface SkMatrix extends SkJSIInstance<"Matrix"> {
  concat: (matrix: SkMatrix | number[]) => SkMatrix;
  translate: (x: number, y: number) => SkMatrix;
  scale: (x: number, y?: number) => SkMatrix;
  skew: (x: number, y: number) => SkMatrix;
  rotate: (theta: number) => SkMatrix;
  postTranslate: (x: number, y: number) => SkMatrix;
  postScale: (x: number, y?: number) => SkMatrix;
  postSkew: (x: number, y: number) => SkMatrix;
  postRotate: (theta: number) => SkMatrix;
  identity: () => SkMatrix;
  get: () => number[];
}

export interface TransformProp {
  transform?: Transforms3d;
}

export const processTransform = <T extends SkMatrix | SkCanvas>(
  m: T,
  transforms: Transforms3d
) => {
  const m3 = processTransform3d(transforms);
  m.concat(m3);
  return m;
};

export const toDegrees = (rad: number) => {
  return (rad * 180) / Math.PI;
};
