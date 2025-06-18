"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WithSkiaWeb = void 0;
var _react = _interopRequireWildcard(require("react"));
var _Platform = require("../Platform");
var _LoadSkiaWeb = require("./LoadSkiaWeb");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const WithSkiaWeb = ({
  getComponent,
  fallback,
  opts,
  componentProps
}) => {
  const Inner = (0, _react.useMemo)(
  // TODO: investigate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  () => /*#__PURE__*/(0, _react.lazy)(async () => {
    if (_Platform.Platform.OS === "web") {
      await (0, _LoadSkiaWeb.LoadSkiaWeb)(opts);
    } else {
      console.warn("<WithSkiaWeb /> is only necessary on web. Consider not using on native.");
    }
    return getComponent();
  }),
  // We we to run this only once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);
  return /*#__PURE__*/_react.default.createElement(_react.Suspense, {
    fallback: fallback !== null && fallback !== void 0 ? fallback : null
  }, /*#__PURE__*/_react.default.createElement(Inner, componentProps));
};
exports.WithSkiaWeb = WithSkiaWeb;
//# sourceMappingURL=WithSkiaWeb.js.map