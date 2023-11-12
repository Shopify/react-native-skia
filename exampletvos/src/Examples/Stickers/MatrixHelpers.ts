import type { SkMatrix, Vector } from "@shopify/react-native-skia";
import { MatrixIndex, notifyChange } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

export const scale = (
  matrix: SharedValue<SkMatrix>,
  offset: SkMatrix,
  s: number,
  origin: Vector
) => {
  "worklet";
  const source = matrix.value;
  source.identity();
  source.concat(offset);
  source.translate(origin.x, origin.y);
  source.scale(s, s);
  source.translate(-origin.x, -origin.y);
  notifyChange(matrix);
};

export const rotateZ = (
  matrix: SharedValue<SkMatrix>,
  offset: SkMatrix,
  theta: number,
  origin: Vector
) => {
  "worklet";
  const source = matrix.value;
  source.identity();
  source.concat(offset);
  source.translate(origin.x, origin.y);
  source.rotate(theta);
  source.translate(-origin.x, -origin.y);
  notifyChange(matrix);
};

export const translate = (
  matrix: SharedValue<SkMatrix>,
  x: number,
  y: number
) => {
  "worklet";
  const source = matrix.value;
  source.postTranslate(x, y);
  notifyChange(matrix);
};

export const toM4 = (m3: SkMatrix) => {
  "worklet";
  const m = m3.get();
  const tx = m[MatrixIndex.TransX];
  const ty = m[MatrixIndex.TransY];
  const sx = m[MatrixIndex.ScaleX];
  const sy = m[MatrixIndex.ScaleY];
  const skewX = m[MatrixIndex.SkewX];
  const skewY = m[MatrixIndex.SkewY];
  const persp0 = m[MatrixIndex.Persp0];
  const persp1 = m[MatrixIndex.Persp1];
  const persp2 = m[MatrixIndex.Persp2];
  return [
    sx,
    skewY,
    persp0,
    0,
    skewX,
    sy,
    persp1,
    0,
    0,
    0,
    1,
    0,
    tx,
    ty,
    persp2,
    1,
  ];
};
