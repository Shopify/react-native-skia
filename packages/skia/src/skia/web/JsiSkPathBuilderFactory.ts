import type { CanvasKit, Path } from "canvaskit-wasm";

import type { PathBuilderFactory, SkPath } from "../types";

import { Host } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPathBuilder } from "./JsiSkPathBuilder";

export class JsiSkPathBuilderFactory
  extends Host
  implements PathBuilderFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make() {
    return new JsiSkPathBuilder(this.CanvasKit, new this.CanvasKit.Path());
  }

  MakeFromPath(path: SkPath) {
    const srcPath = JsiSkPath.fromValue<Path>(path);
    return new JsiSkPathBuilder(this.CanvasKit, srcPath.copy());
  }
}
