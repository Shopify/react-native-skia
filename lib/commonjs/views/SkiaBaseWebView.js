"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SkiaBaseWebView = void 0;
var _react = _interopRequireDefault(require("react"));
var _JsiSkSurface = require("../skia/web/JsiSkSurface");
var _Platform = require("../Platform");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* global HTMLCanvasElement */
const pd = _Platform.Platform.PixelRatio;
class SkiaBaseWebView extends _react.default.Component {
  constructor(props) {
    super(props);
    _defineProperty(this, "_surface", null);
    _defineProperty(this, "_unsubscriptions", []);
    _defineProperty(this, "_canvas", null);
    _defineProperty(this, "_canvasRef", /*#__PURE__*/_react.default.createRef());
    _defineProperty(this, "_redrawRequests", 0);
    _defineProperty(this, "requestId", 0);
    _defineProperty(this, "width", 0);
    _defineProperty(this, "height", 0);
    _defineProperty(this, "onLayout", this.onLayoutEvent.bind(this));
  }
  unsubscribeAll() {
    this._unsubscriptions.forEach(u => u());
    this._unsubscriptions = [];
  }
  onLayoutEvent(evt) {
    const {
      CanvasKit
    } = global;
    // Reset canvas / surface on layout change
    const canvas = this._canvasRef.current;
    if (canvas) {
      this.width = canvas.clientWidth;
      this.height = canvas.clientHeight;
      canvas.width = this.width * pd;
      canvas.height = this.height * pd;
      const surface = CanvasKit.MakeWebGLCanvasSurface(canvas);
      if (!surface) {
        throw new Error("Could not create surface");
      }
      this._surface = new _JsiSkSurface.JsiSkSurface(CanvasKit, surface);
      this._canvas = this._surface.getCanvas();
      this.redraw();
    }
    // Call onLayout callback if it exists
    if (this.props.onLayout) {
      this.props.onLayout(evt);
    }
  }
  getSize() {
    return {
      width: this.width,
      height: this.height
    };
  }
  componentDidMount() {
    // Start render loop
    this.tick();
  }
  componentDidUpdate() {
    this.redraw();
  }
  componentWillUnmount() {
    this.unsubscribeAll();
    cancelAnimationFrame(this.requestId);
    // eslint-disable-next-line max-len
    // https://stackoverflow.com/questions/23598471/how-do-i-clean-up-and-unload-a-webgl-canvas-context-from-gpu-after-use
    // https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context
    // We delete the context, only if the context has been intialized
    if (this._surface) {
      var _this$_canvasRef$curr;
      (_this$_canvasRef$curr = this._canvasRef.current) === null || _this$_canvasRef$curr === void 0 || (_this$_canvasRef$curr = _this$_canvasRef$curr.getContext("webgl2")) === null || _this$_canvasRef$curr === void 0 || (_this$_canvasRef$curr = _this$_canvasRef$curr.getExtension("WEBGL_lose_context")) === null || _this$_canvasRef$curr === void 0 || _this$_canvasRef$curr.loseContext();
    }
  }

  /**
   * Creates a snapshot from the canvas in the surface
   * @param rect Rect to use as bounds. Optional.
   * @returns An Image object.
   */
  makeImageSnapshot(rect) {
    var _this$_surface, _this$_surface2;
    this._canvas.clear(CanvasKit.TRANSPARENT);
    this.renderInCanvas(this._canvas);
    (_this$_surface = this._surface) === null || _this$_surface === void 0 || _this$_surface.ref.flush();
    return (_this$_surface2 = this._surface) === null || _this$_surface2 === void 0 ? void 0 : _this$_surface2.makeImageSnapshot(rect);
  }

  /**
   * Override to render
   */

  /**
   * Sends a redraw request to the native SkiaView.
   */
  tick() {
    if (this._redrawRequests > 0) {
      this._redrawRequests = 0;
      if (this._canvas) {
        var _this$_surface3;
        const canvas = this._canvas;
        canvas.clear(Float32Array.of(0, 0, 0, 0));
        canvas.save();
        canvas.scale(pd, pd);
        this.renderInCanvas(canvas);
        canvas.restore();
        (_this$_surface3 = this._surface) === null || _this$_surface3 === void 0 || _this$_surface3.ref.flush();
      }
    }
    this.requestId = requestAnimationFrame(this.tick.bind(this));
  }
  redraw() {
    this._redrawRequests++;
  }
  render() {
    const {
      debug = false,
      ...viewProps
    } = this.props;
    return /*#__PURE__*/_react.default.createElement(_Platform.Platform.View, _extends({}, viewProps, {
      onLayout: this.onLayout
    }), /*#__PURE__*/_react.default.createElement("canvas", {
      ref: this._canvasRef,
      style: {
        display: "flex",
        flex: 1
      }
    }));
  }
}
exports.SkiaBaseWebView = SkiaBaseWebView;
//# sourceMappingURL=SkiaBaseWebView.js.map