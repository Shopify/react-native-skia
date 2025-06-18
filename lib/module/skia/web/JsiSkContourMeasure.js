function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject } from "./Host";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPoint } from "./JsiSkPoint";
export class JsiSkContourMeasure extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "ContourMeasure");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  getPosTan(distance) {
    const posTan = this.ref.getPosTan(distance);
    return [new JsiSkPoint(this.CanvasKit, posTan.slice(0, 2)), new JsiSkPoint(this.CanvasKit, posTan.slice(2))];
  }
  getSegment(startD, stopD, startWithMoveTo) {
    return new JsiSkPath(this.CanvasKit, this.ref.getSegment(startD, stopD, startWithMoveTo));
  }
  isClosed() {
    return this.ref.isClosed();
  }
  length() {
    return this.ref.length();
  }
}
//# sourceMappingURL=JsiSkContourMeasure.js.map