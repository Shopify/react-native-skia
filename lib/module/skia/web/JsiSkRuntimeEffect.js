function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { HostObject } from "./Host";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkShader } from "./JsiSkShader";
export class JsiSkRuntimeEffect extends HostObject {
  constructor(CanvasKit, ref, sksl) {
    super(CanvasKit, ref, "RuntimeEffect");
    this.sksl = sksl;
    _defineProperty(this, "dispose", () => {
      this.ref.delete();
    });
  }
  source() {
    return this.sksl;
  }
  makeShader(uniforms, localMatrix) {
    return new JsiSkShader(this.CanvasKit, this.ref.makeShader(uniforms, localMatrix !== undefined ? JsiSkMatrix.fromValue(localMatrix) : localMatrix));
  }
  makeShaderWithChildren(uniforms, children, localMatrix) {
    return new JsiSkShader(this.CanvasKit, this.ref.makeShaderWithChildren(uniforms, children === null || children === void 0 ? void 0 : children.map(child => JsiSkShader.fromValue(child)), localMatrix !== undefined ? JsiSkMatrix.fromValue(localMatrix) : localMatrix));
  }
  getUniform(index) {
    return this.ref.getUniform(index);
  }
  getUniformCount() {
    return this.ref.getUniformCount();
  }
  getUniformFloatCount() {
    return this.ref.getUniformFloatCount();
  }
  getUniformName(index) {
    return this.ref.getUniformName(index);
  }
}
//# sourceMappingURL=JsiSkRuntimeEffect.js.map