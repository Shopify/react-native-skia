"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useVideoLoading = void 0;
var _react = require("react");
var _skia = require("../../skia");
var _ReanimatedProxy = _interopRequireDefault(require("./ReanimatedProxy"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const runtime = _ReanimatedProxy.default.createWorkletRuntime("video-metadata-runtime");
const useVideoLoading = source => {
  const {
    runOnJS
  } = _ReanimatedProxy.default;
  const [video, setVideo] = (0, _react.useState)(null);
  const cb = (0, _react.useCallback)(src => {
    "worklet";

    const vid = _skia.Skia.Video(src);
    runOnJS(setVideo)(vid);
  }, [runOnJS]);
  (0, _react.useEffect)(() => {
    if (source) {
      _ReanimatedProxy.default.runOnRuntime(runtime, cb)(source);
    }
  }, [cb, source]);
  return video;
};
exports.useVideoLoading = useVideoLoading;
//# sourceMappingURL=useVideoLoading.js.map