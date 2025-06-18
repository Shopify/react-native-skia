import type { CanvasKit, Shader } from "canvaskit-wasm";

import type { SkShader } from "../types";

import { HostObject } from "./Host";

export class JsiSkShader
  extends HostObject<Shader, "Shader">
  implements SkShader
{
  constructor(CanvasKit: CanvasKit, ref: Shader) {
    super(CanvasKit, ref, "Shader");
  }

  dispose = () => {
    this.ref.delete();
  };
}
