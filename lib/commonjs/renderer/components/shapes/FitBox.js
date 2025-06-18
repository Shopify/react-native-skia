"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fitbox = exports.FitBox = void 0;
var _react = _interopRequireWildcard(require("react"));
var _nodes = require("../../../dom/nodes");
var _Group = require("../Group");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const fitbox = (fit, src, dst, rotation = 0) => {
  "worklet";

  const rects = (0, _nodes.fitRects)(fit, rotation === 90 || rotation === 270 ? {
    x: 0,
    y: 0,
    width: src.height,
    height: src.width
  } : src, dst);
  const result = (0, _nodes.rect2rect)(rects.src, rects.dst);
  if (rotation === 90) {
    return [...result, {
      translate: [src.height, 0]
    }, {
      rotate: Math.PI / 2
    }];
  }
  if (rotation === 180) {
    return [...result, {
      translate: [src.width, src.height]
    }, {
      rotate: Math.PI
    }];
  }
  if (rotation === 270) {
    return [...result, {
      translate: [0, src.width]
    }, {
      rotate: -Math.PI / 2
    }];
  }
  return result;
};
exports.fitbox = fitbox;
const FitBox = ({
  fit = "contain",
  src,
  dst,
  children
}) => {
  const transform = (0, _react.useMemo)(() => fitbox(fit, src, dst), [dst, fit, src]);
  return /*#__PURE__*/_react.default.createElement(_Group.Group, {
    transform: transform
  }, children);
};
exports.FitBox = FitBox;
//# sourceMappingURL=FitBox.js.map