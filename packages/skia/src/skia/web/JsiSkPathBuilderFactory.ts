import type { CanvasKit } from "canvaskit-wasm";

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
    return new JsiSkPathBuilder(
      this.CanvasKit,
      new this.CanvasKit.PathBuilder()
    );
  }

  MakeFromPath(path: SkPath) {
    const srcBuilder =
      JsiSkPath.fromValue<CanvasKit["PathBuilder"]["prototype"]>(path);
    const srcPath = srcBuilder.snapshot();
    const builder = new this.CanvasKit.PathBuilder(srcPath);
    srcPath.delete();
    return new JsiSkPathBuilder(this.CanvasKit, builder);
  }
}
