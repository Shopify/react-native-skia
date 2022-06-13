import type { CanvasKit, Path } from "canvaskit-wasm";

import { PathVerb } from "../types";
import type {
  FillType,
  PathCommand,
  PathOp,
  SkMatrix,
  SkPath,
  SkPoint,
  SkRect,
  SkRRect,
  StrokeOpts,
} from "../types";

import {
  ckEnum,
  HostObject,
  NotImplementedOnRNWeb,
  optEnum,
  toValue,
} from "./Host";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkPath extends HostObject<Path, "Path"> implements SkPath {
  constructor(CanvasKit: CanvasKit, ref: Path) {
    super(CanvasKit, ref, "Path");
  }

  addArc(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number
  ) {
    this.ref.addArc(toValue(oval), startAngleInDegrees, sweepAngleInDegrees);
    return this;
  }

  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number) {
    this.ref.addOval(toValue(oval), isCCW, startIndex);
    return this;
  }

  countPoints() {
    return this.ref.countPoints();
  }

  addPoly(points: SkPoint[], close: boolean) {
    this.ref.addPoly(
      points.map((p) => toValue(p)),
      close
    );
    return this;
  }

  moveTo(x: number, y: number) {
    this.ref.moveTo(x, y);
    return this;
  }

  lineTo(x: number, y: number) {
    this.ref.lineTo(x, y);
    return this;
  }

  makeAsWinding() {
    const result = this.ref.makeAsWinding();
    return result === null ? result : this;
  }

  offset(dx: number, dy: number) {
    this.ref.offset(dx, dy);
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

  rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number) {
    this.ref.rConicTo(dx1, dy1, dx2, dy2, w);
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

  rMoveTo(x: number, y: number) {
    this.ref.rMoveTo(x, y);
    return this;
  }

  rLineTo(x: number, y: number) {
    this.ref.rLineTo(x, y);
    return this;
  }

  rQuadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.rQuadTo(x1, y1, x2, y2);
    return this;
  }

  setFillType(fill: FillType) {
    this.ref.setFillType(ckEnum(fill));
  }

  setIsVolatile(volatile: boolean) {
    this.ref.setIsVolatile(volatile);
  }

  stroke(opts?: StrokeOpts) {
    const result = this.ref.stroke(
      opts === undefined
        ? undefined
        : {
            width: opts.width,
            // eslint-disable-next-line camelcase
            miter_limit: opts.width,
            precision: opts.width,
            join: optEnum(opts.join),
            cap: optEnum(opts.cap),
          }
    );
    return result === null ? result : this;
  }

  close() {
    this.ref.close();
  }

  reset() {
    this.ref.reset();
  }

  rewind() {
    this.ref.rewind();
  }

  computeTightBounds(): SkRect {
    return new JsiSkRect(this.CanvasKit, this.ref.computeTightBounds());
  }

  arcToOval(
    oval: SkRect,
    startAngleInDegrees: number,
    sweepAngleInDegrees: number,
    forceMoveTo: boolean
  ) {
    this.ref.arcToOval(
      toValue(oval),
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

  arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
    return this;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    return this;
  }

  contains(x: number, y: number) {
    return this.ref.contains(x, y);
  }

  copy() {
    return new JsiSkPath(this.CanvasKit, this.ref.copy());
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

  dash(on: number, off: number, phase: number) {
    return this.ref.dash(on, off, phase);
  }

  equals(other: SkPath) {
    return this.ref.equals(toValue(other));
  }

  getBounds() {
    return new JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }

  getFillType() {
    return this.ref.getFillType().value;
  }

  quadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.quadTo(x1, y1, x2, y2);
  }

  addRect(rect: SkRect, isCCW?: boolean) {
    this.ref.addRect(toValue(rect), isCCW);
  }

  addRRect(rrect: SkRRect, isCCW?: boolean) {
    this.ref.addRRect(toValue(rrect), isCCW);
    return this;
  }

  getPoint(index: number) {
    return new JsiSkPoint(this.CanvasKit, this.ref.getPoint(index));
  }

  isEmpty() {
    return this.ref.isEmpty();
  }

  isVolatile() {
    return this.ref.isVolatile();
  }

  addCircle(x: number, y: number, r: number) {
    // We leave the comment below to remind us that this is not implemented in CanvasKit
    // throw new NotImplementedOnRNWeb();
    this.ref.addOval(this.CanvasKit.LTRBRect(x - r, y - r, x + r, y + r));
    return this;
  }

  getLastPt() {
    return new JsiSkPoint(
      this.CanvasKit,
      this.ref.getPoint(this.ref.countPoints() - 1)
    );
  }

  op(path: SkPath, op: PathOp) {
    return this.ref.op(toValue(path), ckEnum(op));
  }

  simplify() {
    return this.ref.simplify();
  }

  toSVGString() {
    return this.ref.toSVGString();
  }

  trim(startT: number, stopT: number, isComplement: boolean) {
    const result = this.ref.trim(startT, stopT, isComplement);
    return result === null ? result : this;
  }

  transform(m3: SkMatrix) {
    this.ref.transform(toValue(m3));
  }

  interpolate(_end: SkPath, _weight: number): SkPath {
    throw new NotImplementedOnRNWeb();
  }

  isInterpolatable(_compare: SkPath): boolean {
    throw new NotImplementedOnRNWeb();
  }

  toCmds(): PathCommand[] {
    const cmds: PathCommand[] = [];
    let cmd = [];
    const flatCmds = this.ref.toCmds();
    const CmdCount = {
      [PathVerb.Move]: 3,
      [PathVerb.Line]: 3,
      [PathVerb.Quad]: 5,
      [PathVerb.Conic]: 6,
      [PathVerb.Cubic]: 7,
      [PathVerb.Close]: 0,
      [PathVerb.Done]: 0,
    };
    for (let i = 0; i < flatCmds.length; i++) {
      if (cmd.length === 0 && flatCmds[i] === PathVerb.Done) {
        break;
      }
      const c = flatCmds[i];
      cmd.push(c);
      if (cmd.length > 1) {
        const length = CmdCount[cmd[0] as PathVerb];
        if (cmd.length === length) {
          cmds.push(cmd);
          cmd = [];
        }
      }
    }
    return cmds.concat(cmd);
  }
}
