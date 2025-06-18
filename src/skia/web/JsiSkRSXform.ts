import type { CanvasKit } from "canvaskit-wasm";

import type { SkRSXform } from "../types";

import { BaseHostObject } from "./Host";

export type RSXform = Float32Array;

export class JsiSkRSXform
  extends BaseHostObject<RSXform, "RSXform">
  implements SkRSXform
{
  static fromValue(rsxform: SkRSXform) {
    if (rsxform instanceof JsiSkRSXform) {
      return rsxform.ref;
    }
    return Float32Array.of(rsxform.scos, rsxform.ssin, rsxform.tx, rsxform.ty);
  }

  constructor(CanvasKit: CanvasKit, ref: RSXform) {
    super(CanvasKit, ref, "RSXform");
  }
  set(scos: number, ssin: number, tx: number, ty: number) {
    this.ref[0] = scos;
    this.ref[1] = ssin;
    this.ref[2] = tx;
    this.ref[3] = ty;
  }
  get scos() {
    return this.ref[0];
  }
  get ssin() {
    return this.ref[1];
  }
  get tx() {
    return this.ref[2];
  }
  get ty() {
    return this.ref[3];
  }
  dispose = () => {
    // nothing to do here, RSXform is a Float32Array
  };
}
