function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import React from "react";
import SkiaPictureViewNativeComponent from "../specs/SkiaPictureViewNativeComponent";
import { SkiaViewApi } from "./api";
import { SkiaViewNativeId } from "./SkiaViewNativeId";
const NativeSkiaPictureView = SkiaPictureViewNativeComponent;
export class SkiaPictureView extends React.Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "requestId", 0);
    _defineProperty(this, "_nativeId", void 0);
    this._nativeId = SkiaViewNativeId.current++;
    const {
      picture,
      onSize
    } = props;
    if (picture) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "picture", picture);
    }
    if (onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.tick();
  }
  get nativeId() {
    return this._nativeId;
  }
  componentDidUpdate(prevProps) {
    const {
      picture,
      onSize
    } = this.props;
    if (picture !== prevProps.picture) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "picture", picture);
    }
    if (onSize !== prevProps.onSize) {
      assertSkiaViewApi();
      SkiaViewApi.setJsiProperty(this._nativeId, "onSize", onSize);
    }
    this.tick();
  }
  componentWillUnmount() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  }
  tick() {
    this.redraw();
    if (this.props.mode === "continuous") {
      this.requestId = requestAnimationFrame(this.tick.bind(this));
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  makeImageSnapshot(rect) {
    assertSkiaViewApi();
    return SkiaViewApi.makeImageSnapshot(this._nativeId, rect);
  }

  /**
   * Sends a redraw request to the native SkiaView.
   */
  redraw() {
    assertSkiaViewApi();
    SkiaViewApi.requestRedraw(this._nativeId);
  }
  render() {
    const {
      mode,
      debug = false,
      opaque = false,
      ...viewProps
    } = this.props;
    return /*#__PURE__*/React.createElement(NativeSkiaPictureView, _extends({
      collapsable: false,
      nativeID: `${this._nativeId}`,
      debug: debug,
      opaque: opaque
    }, viewProps));
  }
}
const assertSkiaViewApi = () => {
  if (SkiaViewApi === null || SkiaViewApi.setJsiProperty === null || SkiaViewApi.requestRedraw === null || SkiaViewApi.makeImageSnapshot === null) {
    throw Error("Skia View Api was not found.");
  }
};
//# sourceMappingURL=SkiaPictureView.js.map