import type { CanvasKit, Matrix3x3 } from "canvaskit-wasm";

import type { SkMatrix } from "../types";

import { HostObject } from "./Host";

export class JsiSkMatrix
  extends HostObject<Matrix3x3, "Matrix">
  implements SkMatrix
{
  constructor(CanvasKit: CanvasKit, ref: Matrix3x3) {
    super(CanvasKit, ref, "Matrix");
  }

  dispose = () => {
    // Do nothing - the matrix is represenetd by a Float32Array
  };

  reset() {
    this.ref.set(this.CanvasKit.Matrix.identity());
  }

  setAll(
    scaleX: number,
    skewX: number,
    transX: number,
    skewY: number,
    scaleY: number,
    transY: number,
    pers0: number,
    pers1: number,
    pers2: number
  ) {
    this.ref.set(
      Float32Array.of(
        scaleX,
        skewX,
        transX,
        skewY,
        scaleY,
        transY,
        pers0,
        pers1,
        pers2
      )
    );
  }

  swap(matrix: SkMatrix) {
    this.ref.set(JsiSkMatrix.fromValue(matrix));
  }

  concat(matrix: SkMatrix) {
    this.ref.set(
      this.CanvasKit.Matrix.multiply(this.ref, JsiSkMatrix.fromValue(matrix))
    );
    return this;
  }

  translate(x: number, y: number) {
    this.concat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.translated(x, y))
      )
    );
    return this;
  }

  scale(x: number, y?: number) {
    this.concat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.scaled(x, y ?? x))
      )
    );
    return this;
  }

  skew(x: number, y: number) {
    this.concat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.skewed(x, y))
      )
    );
    return this;
  }

  rotate(value: number) {
    this.concat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.rotated(value))
      )
    );
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
