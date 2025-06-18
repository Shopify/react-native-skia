function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
export class JsiSkAnimatedImage extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "AnimatedImage");
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  decodeNextFrame() {
    return this.ref.decodeNextFrame();
  }
  currentFrameDuration() {
    return this.ref.currentFrameDuration();
  }
  getFrameCount() {
    return this.ref.getFrameCount();
  }
  getCurrentFrame() {
    const image = this.ref.makeImageAtCurrentFrame();
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }
}
//# sourceMappingURL=JsiSkAnimatedImage.js.map