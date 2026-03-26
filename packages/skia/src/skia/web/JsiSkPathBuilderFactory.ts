import type { CanvasKit, Path } from "canvaskit-wasm";

import type { SkPath } from "../types";
import type { PathBuilderFactory, SkPathBuilder } from "../types/PathBuilder";

import { Host } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPathBuilder } from "./JsiSkPathBuilder";

export class JsiSkPathBuilderFactory extends Host implements PathBuilderFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make(): SkPathBuilder {
    return new JsiSkPathBuilder(this.CanvasKit, new this.CanvasKit.Path());
  }

  MakeFromPath(path: SkPath): SkPathBuilder {
    const ref = JsiSkPath.fromValue<Path>(path);
    return new JsiSkPathBuilder(this.CanvasKit, ref.copy());
  }
}
