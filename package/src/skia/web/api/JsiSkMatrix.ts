import type { CanvasKit, Matrix3x3 } from "canvaskit-wasm";

import type { SkMatrix } from "../../types";

import { HostObject, toValue } from "./Host";

export class JsiSkMatrix
  extends HostObject<Matrix3x3, "Matrix">
  implements SkMatrix
{
  constructor(CanvasKit: CanvasKit, ref: Matrix3x3) {
    super(CanvasKit, ref, "Matrix");
  }

  preConcat(matrix: SkMatrix) {
    this.ref.set(this.CanvasKit.Matrix.multiply(this.ref, toValue(matrix)));
  }

  preTranslate(x: number, y: number) {
    this.preConcat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.translated(x, y))
      )
    );
  }

  preScale(x: number, y: number) {
    this.preConcat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.scaled(x, y))
      )
    );
  }

  preSkew(x: number, y: number) {
    this.preConcat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(...this.CanvasKit.Matrix.skewed(x, y))
      )
    );
  }

  preRotate(value: number) {
    this.preConcat(
      new JsiSkMatrix(
        this.CanvasKit,
        Float32Array.of(
          ...this.CanvasKit.Matrix.rotated((value * 180) / Math.PI)
        )
      )
    );
  }
}
