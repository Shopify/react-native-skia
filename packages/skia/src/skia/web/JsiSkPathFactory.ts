import type { CanvasKit, Path } from "canvaskit-wasm";

import type {
  InputRRect,
  PathCommand,
  PathOp,
  SkFont,
  SkPath,
  SkPoint,
  SkRect,
  StrokeOpts,
} from "../types";
import type { PathFactory } from "../types/Path/PathFactory";

import { Host, getEnum, optEnum, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkRRect } from "./JsiSkRRect";

const pinT = (t: number) => Math.min(Math.max(t, 0), 1);

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
      JsiSkPath.fromValue(one),
      JsiSkPath.fromValue(two),
      getEnum(this.CanvasKit, "PathOp", op)
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

  MakeFromText(_text: string, _x: number, _y: number, _font: SkFont) {
    return throwNotImplementedOnRNWeb<SkPath>();
  }

  // Static shape factories

  Rect(rect: SkRect, isCCW?: boolean) {
    const path = new this.CanvasKit.Path();
    path.addRect(JsiSkRect.fromValue(this.CanvasKit, rect), isCCW);
    return new JsiSkPath(this.CanvasKit, path);
  }

  Oval(rect: SkRect, isCCW?: boolean, startIndex?: number) {
    const path = new this.CanvasKit.Path();
    path.addOval(JsiSkRect.fromValue(this.CanvasKit, rect), isCCW, startIndex);
    return new JsiSkPath(this.CanvasKit, path);
  }

  Circle(x: number, y: number, r: number) {
    const path = new this.CanvasKit.Path();
    path.addCircle(x, y, r);
    return new JsiSkPath(this.CanvasKit, path);
  }

  RRect(rrect: InputRRect, isCCW?: boolean) {
    const path = new this.CanvasKit.Path();
    path.addRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), isCCW);
    return new JsiSkPath(this.CanvasKit, path);
  }

  Line(p1: SkPoint, p2: SkPoint) {
    const path = new this.CanvasKit.Path();
    const pt1 = JsiSkPoint.fromValue(p1);
    const pt2 = JsiSkPoint.fromValue(p2);
    path.moveTo(pt1[0], pt1[1]);
    path.lineTo(pt2[0], pt2[1]);
    return new JsiSkPath(this.CanvasKit, path);
  }

  Polygon(points: SkPoint[], close: boolean) {
    const path = new this.CanvasKit.Path();
    path.addPoly(
      points.map((p) => Array.from(JsiSkPoint.fromValue(p))).flat(),
      close
    );
    return new JsiSkPath(this.CanvasKit, path);
  }

  // Static path operations

  Stroke(srcPath: SkPath, opts?: StrokeOpts) {
    const path = JsiSkPath.fromValue<Path>(srcPath).copy();
    const result = path.stroke(
      opts === undefined
        ? undefined
        : {
            width: opts.width,
            // eslint-disable-next-line camelcase
            miter_limit: opts.miter_limit,
            precision: opts.precision,
            join: optEnum(this.CanvasKit, "StrokeJoin", opts.join),
            cap: optEnum(this.CanvasKit, "StrokeCap", opts.cap),
          }
    );
    if (result === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  Trim(srcPath: SkPath, start: number, end: number, isComplement: boolean) {
    const startT = pinT(start);
    const stopT = pinT(end);
    const path = JsiSkPath.fromValue<Path>(srcPath).copy();
    // Special case: full path (no trimming needed)
    // CanvasKit's trim has edge case issues with exactly 0 and 1
    if (startT === 0 && stopT === 1 && !isComplement) {
      return new JsiSkPath(this.CanvasKit, path);
    }
    // Use small epsilon to avoid edge case issues in CanvasKit
    const eps = 1e-6;
    const safeStartT = startT === 0 ? eps : startT;
    const safeStopT = stopT === 1 ? 1 - eps : stopT;
    const result = path.trim(safeStartT, safeStopT, isComplement);
    if (result === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  Simplify(srcPath: SkPath) {
    const path = JsiSkPath.fromValue<Path>(srcPath).copy();
    const success = path.simplify();
    if (!success) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  Dash(srcPath: SkPath, on: number, off: number, phase: number) {
    const path = JsiSkPath.fromValue<Path>(srcPath).copy();
    const success = path.dash(on, off, phase);
    if (!success) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  AsWinding(srcPath: SkPath) {
    const path = JsiSkPath.fromValue<Path>(srcPath);
    const result = path.makeAsWinding();
    if (result === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, result);
  }

  Interpolate(start: SkPath, end: SkPath, weight: number) {
    const path = this.CanvasKit.Path.MakeFromPathInterpolation(
      JsiSkPath.fromValue(start),
      JsiSkPath.fromValue(end),
      weight
    );
    if (path === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }
}
