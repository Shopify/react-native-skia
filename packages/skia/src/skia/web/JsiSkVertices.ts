import type { CanvasKit, Vertices } from "canvaskit-wasm";

import type { SkVertices } from "../types";

import { HostObject } from "./Host";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkVertices
  extends HostObject<Vertices, "Vertices">
  implements SkVertices
{
  constructor(CanvasKit: CanvasKit, ref: Vertices) {
    super(CanvasKit, ref, "Vertices");
  }

  bounds() {
    return new JsiSkRect(this.CanvasKit, this.ref.bounds());
  }

  uniqueID() {
    return this.ref.uniqueID();
  }
}
