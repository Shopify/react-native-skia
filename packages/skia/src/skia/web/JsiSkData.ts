import type { CanvasKit } from "canvaskit-wasm";

import type { SkData } from "../types";

import { HostObject } from "./Host";

type Data = ArrayBuffer;

export class JsiSkData extends HostObject<Data, "Data"> implements SkData {
  constructor(CanvasKit: CanvasKit, ref: Data) {
    super(CanvasKit, ref, "Data");
  }
}
