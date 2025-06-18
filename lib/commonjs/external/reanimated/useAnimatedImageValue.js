"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAnimatedImageValue = void 0;
var _AnimatedImage = require("../../skia/core/AnimatedImage");
var _ReanimatedProxy = _interopRequireDefault(require("./ReanimatedProxy"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DEFAULT_FRAME_DURATION = 60;
const useAnimatedImageValue = (source, paused) => {
  const defaultPaused = _ReanimatedProxy.default.useSharedValue(false);
  const isPaused = paused !== null && paused !== void 0 ? paused : defaultPaused;
  const currentFrame = _ReanimatedProxy.default.useSharedValue(null);
  const lastTimestamp = _ReanimatedProxy.default.useSharedValue(-1);
  const animatedImage = (0, _AnimatedImage.useAnimatedImage)(source, err => {
    console.error(err);
    throw new Error(`Could not load animated image - got '${err.message}'`);
  });
  const frameDuration = (animatedImage === null || animatedImage === void 0 ? void 0 : animatedImage.currentFrameDuration()) || DEFAULT_FRAME_DURATION;
  _ReanimatedProxy.default.useFrameCallback(frameInfo => {
    if (!animatedImage) {
      currentFrame.value = null;
      return;
    }
    if (isPaused.value && lastTimestamp.value !== -1) {
      return;
    }
    const {
      timestamp
    } = frameInfo;
    const elapsed = timestamp - lastTimestamp.value;

    // Check if it's time to switch frames based on GIF frame duration
    if (elapsed < frameDuration) {
      return;
    }

    // Update the current frame
    animatedImage.decodeNextFrame();
    const oldFrame = currentFrame.value;
    currentFrame.value = animatedImage.getCurrentFrame();
    if (oldFrame) {
      oldFrame.dispose();
    }

    // Update the last timestamp
    lastTimestamp.value = timestamp;
  });
  return currentFrame;
};
exports.useAnimatedImageValue = useAnimatedImageValue;
//# sourceMappingURL=useAnimatedImageValue.js.map