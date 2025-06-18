"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkiaSGRoot = void 0;
var _reactReconciler = _interopRequireDefault(require("react-reconciler"));
var _types = require("../dom/types");
var _HostConfig = require("./HostConfig");
var _Container = require("./Container");
require("./Elements");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const skiaReconciler = (0, _reactReconciler.default)(_HostConfig.sksgHostConfig);
skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia"
});
class SkiaSGRoot {
  constructor(Skia, nativeId = -1) {
    this.Skia = Skia;
    _defineProperty(this, "root", void 0);
    _defineProperty(this, "container", void 0);
    this.container = (0, _Container.createContainer)(Skia, nativeId);
    this.root = skiaReconciler.createContainer(this.container, 0, null, true, null, "", console.error, null);
  }
  get sg() {
    const children = this.container.root;
    return {
      type: _types.NodeType.Group,
      props: {},
      children,
      isDeclaration: false
    };
  }
  render(element) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    skiaReconciler.updateContainer(element, this.root, null, () => {
      (0, _HostConfig.debug)("updateContainer");
    });
  }
  drawOnCanvas(canvas) {
    this.container.drawOnCanvas(canvas);
  }
  getPicture() {
    const recorder = this.Skia.PictureRecorder();
    const canvas = recorder.beginRecording();
    this.drawOnCanvas(canvas);
    return recorder.finishRecordingAsPicture();
  }
  unmount() {
    this.container.unmount();
    skiaReconciler.updateContainer(null, this.root, null, () => {
      (0, _HostConfig.debug)("unmountContainer");
    });
  }
}
exports.SkiaSGRoot = SkiaSGRoot;
//# sourceMappingURL=Reconciler.js.map