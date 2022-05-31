import type { CanvasKit, Path } from "canvaskit-wasm";

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
} from "../../types";
import { PathVerb } from "../../types";
import type { SkFont } from "../../types/Font/Font";

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
    // TODO: fix in SkPath
    return this;
  }

  addOval(oval: SkRect, isCCW?: boolean, startIndex?: number) {
    this.ref.addOval(toValue(oval), isCCW, startIndex);
  }

  countPoints() {
    return this.ref.countPoints();
  }

  addPoly(points: SkPoint[], close: boolean) {
    this.ref.addPoly(
      points.map((p) => toValue(p)),
      close
    );
  }

  moveTo(x: number, y: number) {
    this.ref.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.ref.lineTo(x, y);
  }

  makeAsWinding() {
    const result = this.ref.makeAsWinding();
    return result === null ? result : new JsiSkPath(this.CanvasKit, result);
  }

  offset(dx: number, dy: number) {
    this.ref.offset(dx, dy);
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
  }

  rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number) {
    this.ref.rConicTo(dx1, dy1, dx2, dy2, w);
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
  }

  rMoveTo(x: number, y: number) {
    this.ref.rMoveTo(x, y);
    // TODO: fix in SkPath
    return this;
  }

  rLineTo(x: number, y: number) {
    this.ref.rLineTo(x, y);
    // TODO: fix in SkPath
    return this;
  }

  rQuadTo(x1: number, y1: number, x2: number, y2: number) {
    this.ref.rQuadTo(x1, y1, x2, y2);
    // TODO: fix in SkPath
    return this;
  }

  setFillType(fill: FillType) {
    this.ref.setFillType(ckEnum(fill));
  }

  setIsVolatile(volatile: boolean) {
    this.ref.setIsVolatile(volatile);
  }

  stroke(opts?: StrokeOpts): boolean {
    return !!this.ref.stroke(
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
    // TODO: fix in SkPath
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
    // TODO: fix in SkPath
    return this;
  }

  arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
    // TODO: fix in SkPath
    return this;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    // TODO: fix in SkPath
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
    //TODO: fix in SkPath
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

  addCircle(_x: number, _y: number, _r: number) {
    throw new NotImplementedOnRNWeb();
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
    return !!this.ref.trim(startT, stopT, isComplement);
  }

  transform(m3: SkMatrix) {
    this.ref.transform(toValue(m3));
  }

  // TODO: Move to Factory
  fromText(_text: string, _x: number, _y: number, _font: SkFont) {
    throw new NotImplementedOnRNWeb();
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
