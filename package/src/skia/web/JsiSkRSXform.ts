import type { CanvasKit } from "canvaskit-wasm";

import type { SkRSXform } from "../types";

import { HostObject } from "./Host";

export type RSXform = Float32Array;

export class JsiSkRSXform
  extends HostObject<RSXform, "RSXform">
  implements SkRSXform
{
  constructor(CanvasKit: CanvasKit, ref: RSXform) {
    super(CanvasKit, ref, "RSXform");
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
