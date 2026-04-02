import type { CanvasKit, PathBuilder as CKPathBuilder } from "canvaskit-wasm";

import { PathVerb } from "../types";
import type {
  FillType,
  PathCommand,
  PathOp,
  SkMatrix,
  SkPath,
  SkPoint,
  SkRect,
  InputRRect,
  StrokeOpts,
  InputMatrix,
} from "../types";

import { getEnum, HostObject, optEnum } from "./Host";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkRRect } from "./JsiSkRRect";
import { JsiSkMatrix } from "./JsiSkMatrix";

const CommandCount = {
  [PathVerb.Move]: 3,
  [PathVerb.Line]: 3,
  [PathVerb.Quad]: 5,
  [PathVerb.Conic]: 6,
  [PathVerb.Cubic]: 7,
  [PathVerb.Close]: 1,
};

export const toMatrix3x3 = (m: InputMatrix): number[] => {
  let matrix =
    m instanceof JsiSkMatrix
      ? Array.from(JsiSkMatrix.fromValue<Float32Array>(m))
      : (m as Exclude<InputMatrix, SkMatrix>);
  if (matrix.length === 16) {
    matrix = [
      matrix[0],
      matrix[1],
      matrix[3],
      matrix[4],
      matrix[5],
      matrix[7],
      matrix[12],
      matrix[13],
      matrix[15],
    ];
  } else if (matrix.length !== 9) {
    throw new Error(`Invalid matrix length: ${matrix.length}`);
  }
  return matrix as number[];
};

/**
 * SkPath wraps a CK PathBuilder internally, providing both mutable building
 * methods and immutable query methods. Use snapshot() internally to get
 * an immutable CK Path for read-only operations.
 */
export class JsiSkPath
  extends HostObject<CKPathBuilder, "Path">
  implements SkPath
{
  constructor(CanvasKit: CanvasKit, ref: CKPathBuilder) {
    super(CanvasKit, ref, "Path");
  }

  /** Returns an immutable CK Path snapshot for read-only operations. */
  private asPath() {
    return this.ref.snapshot();
  }

  /** Extract an immutable CK Path from a JsiSkPath value (for CK interop). */
  static pathFromValue(value: SkPath) {
    return JsiSkPath.fromValue<CKPathBuilder>(value).snapshot();
  }

  // ---- Mutable building methods ----

  addPath(src: SkPath, matrix?: SkMatrix, extend = false) {
    const srcBuilder = JsiSkPath.fromValue<CKPathBuilder>(src);
    const srcPath = srcBuilder.snapshot();
    const args = [
      srcPath,
      ...(matrix ? JsiSkMatrix.fromValue<Float32Array>(matrix) : []),
      extend,
    ];
    this.ref.addPath(...args);
    srcPath.delete();
    return this;
  }

  addArc(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number
  ) {
    this.ref.addArc(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      startAngleInDegrees,
      sweepAngleInDegrees
    );
    return this;
  }

  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number) {
    this.ref.addOval(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      isCCW,
      startIndex
    );
    return this;
  }

  addPoly(points: SkPoint[], close: boolean) {
    this.ref.addPolygon(
      points.map((p) => Array.from(JsiSkPoint.fromValue(p))).flat(),
      close
    );
    return this;
  }

  addRect(rect: SkRect, isCCW?: boolean) {
    this.ref.addRect(JsiSkRect.fromValue(this.CanvasKit, rect), isCCW);
    return this;
  }

  addRRect(rrect: InputRRect, isCCW?: boolean) {
    this.ref.addRRect(JsiSkRRect.fromValue(this.CanvasKit, rrect), isCCW);
    return this;
  }

  addCircle(x: number, y: number, r: number) {
    this.ref.addCircle(x, y, r);
    return this;
  }

  moveTo(x: number, y: number) {
    this.ref.moveTo(x, y);
    return this;
  }

  rMoveTo(x: number, y: number) {
    this.ref.rMoveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number) {
    this.ref.lineTo(x, y);
    return this;
  }

  rLineTo(x: number, y: number) {
    this.ref.rLineTo(x, y);
    return this;
  }

  quadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.quadTo(x1, y1, x2, y2);
    return this;
  }

  rQuadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.rQuadTo(x1, y1, x2, y2);
    return this;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    return this;
  }

  rConicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.rConicTo(x1, y1, x2, y2, w);
    return this;
  }

  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number
  ) {
    this.ref.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    return this;
  }

  rCubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number
  ) {
    this.ref.rCubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    return this;
  }

  close() {
    this.ref.close();
    return this;
  }

  reset() {
    // CK PathBuilder has no reset — recreate
    const newBuilder = new this.CanvasKit.PathBuilder();
    if (
      this.ref !== null &&
      typeof this.ref === "object" &&
      "delete" in this.ref &&
      typeof this.ref.delete === "function"
    ) {
      this.ref.delete();
    }
    this.ref = newBuilder;
    return this;
  }

  rewind() {
    return this.reset();
  }

  arcToOval(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number,
    forceMoveTo: boolean
  ) {
    this.ref.arcToOval(
      JsiSkRect.fromValue(this.CanvasKit, oval),
      startAngleInDegrees,
      sweepAngleInDegrees,
      forceMoveTo
    );
    return this;
  }

  arcToRotated(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    x: number,
    y: number
  ) {
    this.ref.arcToRotated(
      rx,
      ry,
      xAxisRotateInDegrees,
      useSmallArc,
      isCCW,
      x,
      y
    );
    return this;
  }

  rArcTo(
    rx: number,
    ry: number,
    xAxisRotateInDegrees: number,
    useSmallArc: boolean,
    isCCW: boolean,
    dx: number,
    dy: number
  ) {
    this.ref.rArcTo(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, dx, dy);
    return this;
  }

  arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
    return this;
  }

  setFillType(fill: FillType) {
    this.ref.setFillType(getEnum(this.CanvasKit, "FillType", fill));
    return this;
  }

  setIsVolatile(_volatile: boolean) {
    // Not supported in CK PathBuilder — no-op
    return this;
  }

  // ---- Mutable path operations (snapshot, operate, replace) ----

  offset(dx: number, dy: number) {
    this.ref.offset(dx, dy);
    return this;
  }

  transform(m: InputMatrix) {
    const matrix = toMatrix3x3(m);
    this.ref.transform(matrix);
    return this;
  }

  makeAsWinding() {
    const path = this.asPath();
    const result = path.makeAsWinding();
    path.delete();
    if (result === null) {
      return null;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return this;
  }

  simplify() {
    const path = this.asPath();
    const result = path.makeSimplified();
    path.delete();
    if (result === null) {
      return false;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return true;
  }

  op(path: SkPath, op: PathOp) {
    const self = this.asPath();
    const other = JsiSkPath.fromValue<CKPathBuilder>(path).snapshot();
    const result = self.makeCombined(
      other,
      getEnum(this.CanvasKit, "PathOp", op)
    );
    self.delete();
    other.delete();
    if (result === null) {
      return false;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return true;
  }

  dash(on: number, off: number, phase: number) {
    const path = this.asPath();
    const result = path.makeDashed(on, off, phase);
    path.delete();
    if (result === null) {
      return false;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return true;
  }

  stroke(opts?: StrokeOpts) {
    const path = this.asPath();
    const result = path.makeStroked(
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
    path.delete();
    if (result === null) {
      return null;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return this;
  }

  trim(start: number, stop: number, isComplement: boolean) {
    const startT = Math.min(Math.max(start, 0), 1);
    const stopT = Math.min(Math.max(stop, 0), 1);
    if (startT === 0 && stopT === 1 && !isComplement) {
      return this;
    }
    const path = this.asPath();
    const result = path.makeTrimmed(startT, stopT, isComplement);
    path.delete();
    if (result === null) {
      return null;
    }
    const old = this.ref;
    this.ref = new this.CanvasKit.PathBuilder(result);
    result.delete();
    old.delete();
    return this;
  }

  // ---- Query methods (use snapshot for read-only) ----

  countPoints() {
    return this.ref.countPoints();
  }

  computeTightBounds(): SkRect {
    const path = this.asPath();
    const result = new JsiSkRect(this.CanvasKit, path.computeTightBounds());
    path.delete();
    return result;
  }

  contains(x: number, y: number) {
    const path = this.asPath();
    const result = path.contains(x, y);
    path.delete();
    return result;
  }

  copy() {
    const path = this.asPath();
    const result = new JsiSkPath(
      this.CanvasKit,
      new this.CanvasKit.PathBuilder(path)
    );
    path.delete();
    return result;
  }

  equals(other: SkPath) {
    const p1 = this.asPath();
    const p2 = JsiSkPath.fromValue<CKPathBuilder>(other).snapshot();
    const result = p1.equals(p2);
    p1.delete();
    p2.delete();
    return result;
  }

  getBounds() {
    return new JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }

  getFillType(): FillType {
    const path = this.asPath();
    const result = path.getFillType().value;
    path.delete();
    return result;
  }

  getPoint(index: number): SkPoint {
    const path = this.asPath();
    const result = new JsiSkPoint(this.CanvasKit, path.getPoint(index));
    path.delete();
    return result;
  }

  isEmpty() {
    return this.ref.isEmpty();
  }

  isVolatile() {
    return false;
  }

  getLastPt() {
    const count = this.ref.countPoints();
    if (count === 0) {
      return { x: 0, y: 0 };
    }
    const path = this.asPath();
    const pt = path.getPoint(count - 1);
    path.delete();
    return { x: pt[0], y: pt[1] };
  }

  toSVGString() {
    const path = this.asPath();
    const result = path.toSVGString();
    path.delete();
    return result;
  }

  isInterpolatable(path2: SkPath): boolean {
    const p1 = this.asPath();
    const p2 = JsiSkPath.fromValue<CKPathBuilder>(path2).snapshot();
    const result = this.CanvasKit.Path.CanInterpolate(p1, p2);
    p1.delete();
    p2.delete();
    return result;
  }

  interpolate(end: SkPath, weight: number, output?: SkPath): SkPath | null {
    const p1 = this.asPath();
    const p2 = JsiSkPath.fromValue<CKPathBuilder>(end).snapshot();
    const path = this.CanvasKit.Path.MakeFromPathInterpolation(p1, p2, weight);
    p1.delete();
    p2.delete();
    if (path === null) {
      return null;
    }
    if (output) {
      const outRef = output as JsiSkPath;
      const old = outRef.ref;
      outRef.ref = new this.CanvasKit.PathBuilder(path);
      path.delete();
      old.delete();
      return output;
    }
    const result = new JsiSkPath(
      this.CanvasKit,
      new this.CanvasKit.PathBuilder(path)
    );
    path.delete();
    return result;
  }

  toCmds() {
    const path = this.asPath();
    const cmds = path.toCmds();
    path.delete();
    const result = cmds.reduce<PathCommand[]>((acc, cmd, i) => {
      if (i === 0) {
        acc.push([]);
      }
      const current = acc[acc.length - 1];
      if (current.length === 0) {
        current.push(cmd);
        const length = CommandCount[current[0] as PathVerb];
        if (current.length === length && i !== cmds.length - 1) {
          acc.push([]);
        }
      } else {
        const length = CommandCount[current[0] as PathVerb];
        if (current.length < length) {
          current.push(cmd);
        }
        if (current.length === length && i !== cmds.length - 1) {
          acc.push([]);
        }
      }
      return acc;
    }, []);
    return result;
  }
}
