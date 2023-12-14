import type { CanvasKit, Matrix3x3 } from "canvaskit-wasm";

import { toMatrix3 } from "../types";
import type { SkMatrix, InputMatrix, Matrix4 } from "../types";

import { HostObject } from "./Host";

const isMatrixHostObject = (obj: InputMatrix): obj is SkMatrix =>
  !Array.isArray(obj);

export class JsiSkMatrix
  extends HostObject<Matrix3x3, "Matrix">
  implements SkMatrix
{
  constructor(CanvasKit: CanvasKit, ref: Matrix3x3) {
    super(CanvasKit, ref, "Matrix");
  }

  private preMultiply(matrix: number[]) {
    this.ref.set(this.CanvasKit.Matrix.multiply(this.ref, matrix));
  }

  private postMultiply(matrix: number[]) {
    this.ref.set(this.CanvasKit.Matrix.multiply(matrix, this.ref));
  }

  dispose = () => {
    // Do nothing - the matrix is represenetd by a Float32Array
  };

  concat(matrix: InputMatrix) {
    this.preMultiply(
      // eslint-disable-next-line no-nested-ternary
      isMatrixHostObject(matrix)
        ? JsiSkMatrix.fromValue(matrix)
        : matrix.length === 16
        ? toMatrix3(matrix as Matrix4)
        : [...matrix]
    );
    return this;
  }

  translate(x: number, y: number) {
    this.preMultiply(this.CanvasKit.Matrix.translated(x, y));
    return this;
  }

  postTranslate(x: number, y: number) {
    this.postMultiply(this.CanvasKit.Matrix.translated(x, y));
    return this;
  }

  scale(x: number, y?: number) {
    this.preMultiply(this.CanvasKit.Matrix.scaled(x, y ?? x));
    return this;
  }

  postScale(x: number, y?: number) {
    this.postMultiply(this.CanvasKit.Matrix.scaled(x, y ?? x));
    return this;
  }

  skew(x: number, y: number) {
    this.preMultiply(this.CanvasKit.Matrix.skewed(x, y));
    return this;
  }

  postSkew(x: number, y: number) {
    this.postMultiply(this.CanvasKit.Matrix.skewed(x, y));
    return this;
  }

  rotate(value: number) {
    this.preMultiply(this.CanvasKit.Matrix.rotated(value));
    return this;
  }

  postRotate(value: number) {
    this.postMultiply(this.CanvasKit.Matrix.rotated(value));
    return this;
  }

  identity() {
    this.ref.set(this.CanvasKit.Matrix.identity());
    return this;
  }

  get() {
    return Array.from(this.ref);
  }
}
