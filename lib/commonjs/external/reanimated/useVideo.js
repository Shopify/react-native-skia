"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useVideo = exports.currentSKImageFrames = void 0;
var _react = require("react");
var _Platform = require("@shopify/react-native-skia/src/Platform/Platform");
var _ReanimatedProxy = _interopRequireDefault(require("@shopify/react-native-skia/src/external/reanimated/ReanimatedProxy"));
var _useVideoLoading = require("@shopify/react-native-skia/src/external/reanimated/useVideoLoading");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const currentSKImageFrames = exports.currentSKImageFrames = [];
const copyFrameOnAndroid = currentFrame => {
  "worklet";

  // on android we need to copy the texture before it's invalidated
  if (_Platform.Platform.OS === "android" || _Platform.Platform.OS === "harmony") {
    const tex = currentFrame.value;
    if (tex) {
      currentFrame.value = tex.makeNonTextureImage();
      //currentSKImageFrames.push(currentFrame.value);
      //console.log("push OK");
      tex.dispose();
    }
  }
};
const setFrame = (video, currentFrame) => {
  "worklet";

  console.log("nextImage");
  const img = video.nextImage();
  if (img) {
    if (currentFrame.value) {
      currentFrame.value.dispose();
    }
    currentFrame.value = img;
    copyFrameOnAndroid(currentFrame);
  }
};
const defaultOptions = {
  looping: true,
  paused: false,
  seek: null,
  currentTime: 0,
  volume: 0
};
const useOption = value => {
  "worklet";

  // TODO: only create defaultValue is needed (via makeMutable)
  const defaultValue = _ReanimatedProxy.default.useSharedValue(_ReanimatedProxy.default.isSharedValue(value) ? value.value : value);
  return _ReanimatedProxy.default.isSharedValue(value) ? value : defaultValue;
};
const disposeVideo = video => {
  "worklet";

  video === null || video === void 0 || video.dispose();
};
const useVideo = (source, userOptions) => {
  var _userOptions$paused, _userOptions$looping, _userOptions$seek, _userOptions$volume;
  const video = (0, _useVideoLoading.useVideoLoading)(source);
  const isPaused = useOption((_userOptions$paused = userOptions === null || userOptions === void 0 ? void 0 : userOptions.paused) !== null && _userOptions$paused !== void 0 ? _userOptions$paused : defaultOptions.paused);
  const looping = useOption((_userOptions$looping = userOptions === null || userOptions === void 0 ? void 0 : userOptions.looping) !== null && _userOptions$looping !== void 0 ? _userOptions$looping : defaultOptions.looping);
  const seek = useOption((_userOptions$seek = userOptions === null || userOptions === void 0 ? void 0 : userOptions.seek) !== null && _userOptions$seek !== void 0 ? _userOptions$seek : defaultOptions.seek);
  const volume = useOption((_userOptions$volume = userOptions === null || userOptions === void 0 ? void 0 : userOptions.volume) !== null && _userOptions$volume !== void 0 ? _userOptions$volume : defaultOptions.volume);
  const currentFrame = _ReanimatedProxy.default.useSharedValue(null);
  const currentTime = _ReanimatedProxy.default.useSharedValue(0);
  const lastTimestamp = _ReanimatedProxy.default.useSharedValue(-1);
  const duration = (0, _react.useMemo)(() => {
    var _video$duration;
    return (_video$duration = video === null || video === void 0 ? void 0 : video.duration()) !== null && _video$duration !== void 0 ? _video$duration : 0;
  }, [video]);
  const framerate = (0, _react.useMemo)(() => {
    var _video$framerate;
    return _Platform.Platform.OS === "web" ? -1 : (_video$framerate = video === null || video === void 0 ? void 0 : video.framerate()) !== null && _video$framerate !== void 0 ? _video$framerate : 0;
  }, [video]);
  const size = (0, _react.useMemo)(() => {
    var _video$size;
    return (_video$size = video === null || video === void 0 ? void 0 : video.size()) !== null && _video$size !== void 0 ? _video$size : {
      width: 0,
      height: 0
    };
  }, [video]);
  const rotation = (0, _react.useMemo)(() => {
    var _video$rotation;
    return (_video$rotation = video === null || video === void 0 ? void 0 : video.rotation()) !== null && _video$rotation !== void 0 ? _video$rotation : 0;
  }, [video]);
  const frameDuration = 1000 / framerate;
  const currentFrameDuration = Math.floor(frameDuration);
  _ReanimatedProxy.default.useAnimatedReaction(() => isPaused.value, paused => {
    if (paused) {
      video === null || video === void 0 || video.pause();
    } else {
      lastTimestamp.value = -1;
      video === null || video === void 0 || video.play();
    }
  });
  _ReanimatedProxy.default.useAnimatedReaction(() => seek.value, value => {
    if (value !== null) {
      video === null || video === void 0 || video.seek(value);
      currentTime.value = value;
      seek.value = null;
    }
  });
  _ReanimatedProxy.default.useAnimatedReaction(() => volume.value, value => {
    video === null || video === void 0 || video.setVolume(value);
  });
  _ReanimatedProxy.default.useFrameCallback(async frameInfo => {
    "worklet";

    if (!video) {
      return;
    }
    if (isPaused.value) {
      return;
    }
    const currentTimestamp = frameInfo.timestamp;
    if (lastTimestamp.value === -1) {
      lastTimestamp.value = currentTimestamp;
    }
    const delta = currentTimestamp - lastTimestamp.value;
    const isOver = currentTime.value + delta > duration;
    if (isOver && looping.value) {
      console.log("in if seek");
      seek.value = 0;
      currentTime.value = seek.value;
      lastTimestamp.value = currentTimestamp;
    }
    // On Web the framerate is uknown.
    // This could be optimized by using requestVideoFrameCallback (Chrome only)

    if (delta > currentFrameDuration * 3 && !isOver || _Platform.Platform.OS === "web") {
      //console.log(`当前时间:${currentTime.value},时间间隔:${delta},当前帧持续时间:${currentFrameDuration}`)
      setFrame(video, currentFrame);
      currentTime.value += delta;
      lastTimestamp.value = currentTimestamp;
    }
  });
  (0, _react.useEffect)(() => {
    return () => {
      // TODO: should video simply be a shared value instead?
      _ReanimatedProxy.default.runOnUI(disposeVideo)(video);
    };
  }, [video]);
  return {
    currentFrame,
    currentTime,
    duration,
    framerate,
    rotation,
    size
  };
};
exports.useVideo = useVideo;
//# sourceMappingURL=useVideo.js.map