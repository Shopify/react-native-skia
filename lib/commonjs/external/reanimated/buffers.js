"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRectBuffer = exports.useRSXformBuffer = exports.usePointBuffer = exports.useColorBuffer = void 0;
var _react = require("react");
var _skia = require("../../skia");
var _interpolators = require("./interpolators");
var _ReanimatedProxy = _interopRequireDefault(require("./ReanimatedProxy"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const useBufferValue = (size, bufferInitializer) => {
  return (0, _react.useMemo)(() => _ReanimatedProxy.default.makeMutable(new Array(size).fill(0).map(bufferInitializer)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [size]);
};
const useBuffer = (size, bufferInitializer, modifier) => {
  var _mod$__closure;
  const values = useBufferValue(size, bufferInitializer);
  const mod = modifier;
  const deps = [size, ...Object.values((_mod$__closure = mod.__closure) !== null && _mod$__closure !== void 0 ? _mod$__closure : {})];
  const mapperId = _ReanimatedProxy.default.startMapper(() => {
    "worklet";

    values.value.forEach((val, index) => {
      modifier(val, index);
    });
    (0, _interpolators.notifyChange)(values);
  }, deps);
  (0, _react.useEffect)(() => {
    return () => {
      _ReanimatedProxy.default.stopMapper(mapperId);
    };
  }, [mapperId]);
  return values;
};
const useRectBuffer = (size, modifier) => useBuffer(size, () => _skia.Skia.XYWHRect(0, 0, 0, 0), modifier);

// Usage for RSXform Buffer
exports.useRectBuffer = useRectBuffer;
const useRSXformBuffer = (size, modifier) => useBuffer(size, () => _skia.Skia.RSXform(1, 0, 0, 0), modifier);

// Usage for Point Buffer
exports.useRSXformBuffer = useRSXformBuffer;
const usePointBuffer = (size, modifier) => useBuffer(size, () => _skia.Skia.Point(0, 0), modifier);

// Usage for Color Buffer
exports.usePointBuffer = usePointBuffer;
const useColorBuffer = (size, modifier) => useBuffer(size, () => _skia.Skia.Color("black"), modifier);
exports.useColorBuffer = useColorBuffer;
//# sourceMappingURL=buffers.js.map