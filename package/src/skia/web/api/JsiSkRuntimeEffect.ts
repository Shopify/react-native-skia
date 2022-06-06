import type { CanvasKit, RuntimeEffect } from "canvaskit-wasm";

import type { SkMatrix, SkShader } from "../../types";
import type { SkRuntimeEffect } from "../../types/RuntimeEffect/RuntimeEffect";

import { HostObject, toValue } from "./Host";
import { JsiSkShader } from "./JsiSkShader";

export class JsiSkRuntimeEffect
  extends HostObject<RuntimeEffect, "RuntimeEffect">
  implements SkRuntimeEffect
{
  constructor(CanvasKit: CanvasKit, ref: RuntimeEffect) {
    super(CanvasKit, ref, "RuntimeEffect");
  }

  makeShader(uniforms: number[], localMatrix?: SkMatrix) {
    return new JsiSkShader(
      this.CanvasKit,
      this.ref.makeShader(
        uniforms,
        localMatrix !== undefined ? toValue(localMatrix) : localMatrix
      )
    );
  }

  makeShaderWithChildren(
    uniforms: number[],
    children?: SkShader[],
    localMatrix?: SkMatrix
  ) {
    return new JsiSkShader(
      this.CanvasKit,
      this.ref.makeShaderWithChildren(
        uniforms,
        children?.map((child) => toValue(child)),
        localMatrix !== undefined ? toValue(localMatrix) : localMatrix
      )
    );
  }

  getUniform(index: number) {
    return this.ref.getUniform(index);
  }

  getUniformCount() {
    return this.ref.getUniformCount();
  }

  getUniformFloatCount() {
    return this.ref.getUniformFloatCount();
  }

  getUniformName(index: number) {
    return this.ref.getUniformName(index);
  }
}
