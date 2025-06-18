"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useVideoLoading = void 0;
var _react = require("react");
var _skia = require("../../skia");
const useVideoLoading = source => {
  const [video, setVideo] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    if (source) {
      const vid = _skia.Skia.Video(source);
      vid.then(v => setVideo(v));
    }
  }, [source]);
  return video;
};
exports.useVideoLoading = useVideoLoading;
//# sourceMappingURL=useVideoLoading.web.js.map