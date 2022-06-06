import type { CanvasKit } from "canvaskit-wasm";

import type { PathCommand, PathOp, SkPath } from "../../types";
import type { PathFactory } from "../../types/Path/PathFactory";

import { Host, ckEnum, toValue } from "./Host";
import { JsiSkPath } from "./JsiSkPath";

export class JsiSkPathFactory extends Host implements PathFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  Make() {
    return new JsiSkPath(this.CanvasKit, new this.CanvasKit.Path());
  }

  MakeFromSVGString(str: string) {
    const path = this.CanvasKit.Path.MakeFromSVGString(str);
    if (path === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  MakeFromOp(one: SkPath, two: SkPath, op: PathOp) {
    const path = this.CanvasKit.Path.MakeFromOp(
      toValue(one),
      toValue(two),
      ckEnum(op)
    );
    if (path === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  MakeFromCmds(cmds: PathCommand[]) {
    const path = this.CanvasKit.Path.MakeFromCmds(cmds.flat());
    if (path === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }
}
