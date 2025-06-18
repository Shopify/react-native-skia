"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkPath = void 0;
var _types = require("../types");
var _Host = require("./Host");
var _JsiSkPoint = require("./JsiSkPoint");
var _JsiSkRect = require("./JsiSkRect");
var _JsiSkRRect = require("./JsiSkRRect");
var _JsiSkMatrix = require("./JsiSkMatrix");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const CommandCount = {
  [_types.PathVerb.Move]: 3,
  [_types.PathVerb.Line]: 3,
  [_types.PathVerb.Quad]: 5,
  [_types.PathVerb.Conic]: 6,
  [_types.PathVerb.Cubic]: 7,
  [_types.PathVerb.Close]: 1
};
const pinT = t => Math.min(Math.max(t, 0), 1);
class JsiSkPath extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Path");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  addPath(src, matrix, extend = false) {
    const args = [JsiSkPath.fromValue(src), ...(matrix ? _JsiSkMatrix.JsiSkMatrix.fromValue(matrix) : []), extend];
    this.ref.addPath(...args);
    return this;
  }
  addArc(oval, startAngleInDegrees, sweepAngleInDegrees) {
    this.ref.addArc(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, oval), startAngleInDegrees, sweepAngleInDegrees);
    return this;
  }
  addOval(oval, isCCW, startIndex) {
    this.ref.addOval(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, oval), isCCW, startIndex);
    return this;
  }
  countPoints() {
    return this.ref.countPoints();
  }
  addPoly(points, close) {
    this.ref.addPoly(points.map(p => Array.from(_JsiSkPoint.JsiSkPoint.fromValue(p))).flat(), close);
    return this;
  }
  moveTo(x, y) {
    this.ref.moveTo(x, y);
    return this;
  }
  lineTo(x, y) {
    this.ref.lineTo(x, y);
    return this;
  }
  makeAsWinding() {
    const result = this.ref.makeAsWinding();
    return result === null ? result : this;
  }
  offset(dx, dy) {
    this.ref.offset(dx, dy);
    return this;
  }
  rArcTo(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, dx, dy) {
    this.ref.rArcTo(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, dx, dy);
    return this;
  }
  rConicTo(dx1, dy1, dx2, dy2, w) {
    this.ref.rConicTo(dx1, dy1, dx2, dy2, w);
    return this;
  }
  rCubicTo(cpx1, cpy1, cpx2, cpy2, x, y) {
    this.ref.rCubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    return this;
  }
  rMoveTo(x, y) {
    this.ref.rMoveTo(x, y);
    return this;
  }
  rLineTo(x, y) {
    this.ref.rLineTo(x, y);
    return this;
  }
  rQuadTo(x1, y1, x2, y2) {
    this.ref.rQuadTo(x1, y1, x2, y2);
    return this;
  }
  setFillType(fill) {
    this.ref.setFillType((0, _Host.getEnum)(this.CanvasKit, "FillType", fill));
    return this;
  }
  setIsVolatile(volatile) {
    this.ref.setIsVolatile(volatile);
    return this;
  }
  stroke(opts) {
    const result = this.ref.stroke(opts === undefined ? undefined : {
      width: opts.width,
      // eslint-disable-next-line camelcase
      miter_limit: opts.width,
      precision: opts.width,
      join: (0, _Host.optEnum)(this.CanvasKit, "StrokeJoin", opts.join),
      cap: (0, _Host.optEnum)(this.CanvasKit, "StrokeCap", opts.cap)
    });
    return result === null ? result : this;
  }
  close() {
    this.ref.close();
    return this;
  }
  reset() {
    this.ref.reset();
    return this;
  }
  rewind() {
    this.ref.rewind();
    return this;
  }
  computeTightBounds() {
    return new _JsiSkRect.JsiSkRect(this.CanvasKit, this.ref.computeTightBounds());
  }
  arcToOval(oval, startAngleInDegrees, sweepAngleInDegrees, forceMoveTo) {
    this.ref.arcToOval(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, oval), startAngleInDegrees, sweepAngleInDegrees, forceMoveTo);
    return this;
  }
  arcToRotated(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, x, y) {
    this.ref.arcToRotated(rx, ry, xAxisRotateInDegrees, useSmallArc, isCCW, x, y);
    return this;
  }
  arcToTangent(x1, y1, x2, y2, radius) {
    this.ref.arcToTangent(x1, y1, x2, y2, radius);
    return this;
  }
  conicTo(x1, y1, x2, y2, w) {
    this.ref.conicTo(x1, y1, x2, y2, w);
    return this;
  }
  contains(x, y) {
    return this.ref.contains(x, y);
  }
  copy() {
    return new JsiSkPath(this.CanvasKit, this.ref.copy());
  }
  cubicTo(cpx1, cpy1, cpx2, cpy2, x, y) {
    this.ref.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    return this;
  }
  dash(on, off, phase) {
    return this.ref.dash(on, off, phase);
  }
  equals(other) {
    return this.ref.equals(JsiSkPath.fromValue(other));
  }
  getBounds() {
    return new _JsiSkRect.JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }
  getFillType() {
    return this.ref.getFillType().value;
  }
  quadTo(x1, y1, x2, y2) {
    this.ref.quadTo(x1, y1, x2, y2);
    return this;
  }
  addRect(rect, isCCW) {
    this.ref.addRect(_JsiSkRect.JsiSkRect.fromValue(this.CanvasKit, rect), isCCW);
    return this;
  }
  addRRect(rrect, isCCW) {
    this.ref.addRRect(_JsiSkRRect.JsiSkRRect.fromValue(this.CanvasKit, rrect), isCCW);
    return this;
  }
  getPoint(index) {
    return new _JsiSkPoint.JsiSkPoint(this.CanvasKit, this.ref.getPoint(index));
  }
  isEmpty() {
    return this.ref.isEmpty();
  }
  isVolatile() {
    return this.ref.isVolatile();
  }
  addCircle(x, y, r) {
    this.ref.addCircle(x, y, r);
    return this;
  }
  getLastPt() {
    return new _JsiSkPoint.JsiSkPoint(this.CanvasKit, this.ref.getPoint(this.ref.countPoints() - 1));
  }
  op(path, op) {
    return this.ref.op(JsiSkPath.fromValue(path), (0, _Host.getEnum)(this.CanvasKit, "PathOp", op));
  }
  simplify() {
    return this.ref.simplify();
  }
  toSVGString() {
    return this.ref.toSVGString();
  }
  trim(start, stop, isComplement) {
    const startT = pinT(start);
    const stopT = pinT(stop);
    if (startT === 0 && stopT === 1) {
      return this;
    }
    const result = this.ref.trim(startT, stopT, isComplement);
    return result === null ? result : this;
  }
  transform(m) {
    let matrix = m instanceof _JsiSkMatrix.JsiSkMatrix ? Array.from(_JsiSkMatrix.JsiSkMatrix.fromValue(m)) : m;
    if (matrix.length === 16) {
      matrix = [matrix[0], matrix[1], matrix[3], matrix[4], matrix[5], matrix[7], matrix[12], matrix[13], matrix[15]];
    } else if (matrix.length !== 9) {
      throw new Error(`Invalid matrix length: ${matrix.length}`);
    }
    this.ref.transform(matrix);
    return this;
  }
  interpolate(end, t, output) {
    const path = this.CanvasKit.Path.MakeFromPathInterpolation(this.ref, JsiSkPath.fromValue(end), t);
    if (path === null) {
      return null;
    }
    if (output) {
      output.ref = path;
      return output;
    } else {
      return new JsiSkPath(this.CanvasKit, path);
    }
  }
  isInterpolatable(path2) {
    return this.CanvasKit.Path.CanInterpolate(this.ref, JsiSkPath.fromValue(path2));
  }
  toCmds() {
    const cmds = this.ref.toCmds();
    const result = cmds.reduce((acc, cmd, i) => {
      if (i === 0) {
        acc.push([]);
      }
      const current = acc[acc.length - 1];
      if (current.length === 0) {
        current.push(cmd);
        const length = CommandCount[current[0]];
        if (current.length === length && i !== cmds.length - 1) {
          acc.push([]);
        }
      } else {
        const length = CommandCount[current[0]];
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
exports.JsiSkPath = JsiSkPath;
//# sourceMappingURL=JsiSkPath.js.map