function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject } from "./Host";
export class JsiSkTypeface extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Typeface");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  get bold() {
    console.warn("Typeface.bold is deprecated and will be removed in a future release. The property will return false.");
    return false;
  }
  get italic() {
    console.warn("Typeface.italic is deprecated and will be removed in a future release. The property will return false.");
    return false;
  }
  getGlyphIDs(str, numCodePoints) {
    return Array.from(this.ref.getGlyphIDs(str, numCodePoints));
  }
}
//# sourceMappingURL=JsiSkTypeface.js.map