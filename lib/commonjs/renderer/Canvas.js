"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useCanvasRef = exports.Canvas = void 0;
var _react = _interopRequireWildcard(require("react"));
var _SkiaViewNativeId = require("../views/SkiaViewNativeId");
var _SkiaPictureViewNativeComponent = _interopRequireDefault(require("../specs/SkiaPictureViewNativeComponent"));
var _Reconciler = require("../sksg/Reconciler");
var _skia = require("../skia");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const useCanvasRef = () => (0, _react.useRef)(null);
exports.useCanvasRef = useCanvasRef;
const NativeSkiaPictureView = _SkiaPictureViewNativeComponent.default;

// TODO: no need to go through the JS thread for this
const useOnSizeEvent = (resultValue, onLayout) => {
  return (0, _react.useCallback)(event => {
    if (onLayout) {
      onLayout(event);
    }
    const {
      width,
      height
    } = event.nativeEvent.layout;
    if (resultValue) {
      resultValue.value = {
        width,
        height
      };
    }
  }, [onLayout, resultValue]);
};
const Canvas = exports.Canvas = /*#__PURE__*/(0, _react.forwardRef)(({
  mode,
  debug,
  opaque,
  children,
  onSize,
  onLayout: _onLayout,
  ...viewProps
}, ref) => {
  const rafId = (0, _react.useRef)(null);
  const onLayout = useOnSizeEvent(onSize, _onLayout);
  // Native ID
  const nativeId = (0, _react.useMemo)(() => {
    return _SkiaViewNativeId.SkiaViewNativeId.current++;
  }, []);

  // Root
  const root = (0, _react.useMemo)(() => new _Reconciler.SkiaSGRoot(_skia.Skia, nativeId), [nativeId]);

  // Render effects
  (0, _react.useLayoutEffect)(() => {
    root.render(children);
  }, [children, root]);
  (0, _react.useEffect)(() => {
    return () => {
      root.unmount();
    };
  }, [root]);
  const requestRedraw = (0, _react.useCallback)(() => {
    rafId.current = requestAnimationFrame(() => {
      root.render(children);
      if (mode === "continuous") {
        requestRedraw();
      }
    });
  }, [children, mode, root]);
  (0, _react.useEffect)(() => {
    if (mode === "continuous") {
      console.warn("The `mode` property in `Canvas` is deprecated.");
      requestRedraw();
    }
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [mode, requestRedraw]);
  // Component methods
  (0, _react.useImperativeHandle)(ref, () => ({
    makeImageSnapshot: rect => {
      return SkiaViewApi.makeImageSnapshot(nativeId, rect);
    },
    makeImageSnapshotAsync: rect => {
      return SkiaViewApi.makeImageSnapshotAsync(nativeId, rect);
    },
    redraw: () => {
      SkiaViewApi.requestRedraw(nativeId);
    },
    getNativeId: () => {
      return nativeId;
    }
  }));
  return /*#__PURE__*/_react.default.createElement(NativeSkiaPictureView, _extends({
    collapsable: false,
    nativeID: `${nativeId}`,
    debug: debug,
    opaque: opaque,
    onLayout: onLayout
  }, viewProps));
});
//# sourceMappingURL=Canvas.js.map