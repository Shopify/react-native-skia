import { useEffect, useMemo } from "react";
import { Platform } from "../../Platform";
import Rea from "./ReanimatedProxy";
import { useVideoLoading } from "./useVideoLoading";
const copyFrameOnAndroid = currentFrame => {
  "worklet";

  // on android we need to copy the texture before it's invalidated
  if (Platform.OS === "android") {
    const tex = currentFrame.value;
    if (tex) {
      currentFrame.value = tex.makeNonTextureImage();
      tex.dispose();
    }
  }
};
const setFrame = (video, currentFrame) => {
  "worklet";

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
  const defaultValue = Rea.useSharedValue(Rea.isSharedValue(value) ? value.value : value);
  return Rea.isSharedValue(value) ? value : defaultValue;
};
const disposeVideo = video => {
  "worklet";

  video === null || video === void 0 || video.dispose();
};
export const useVideo = (source, userOptions) => {
  var _userOptions$paused, _userOptions$looping, _userOptions$seek, _userOptions$volume;
  const video = useVideoLoading(source);
  const isPaused = useOption((_userOptions$paused = userOptions === null || userOptions === void 0 ? void 0 : userOptions.paused) !== null && _userOptions$paused !== void 0 ? _userOptions$paused : defaultOptions.paused);
  const looping = useOption((_userOptions$looping = userOptions === null || userOptions === void 0 ? void 0 : userOptions.looping) !== null && _userOptions$looping !== void 0 ? _userOptions$looping : defaultOptions.looping);
  const seek = useOption((_userOptions$seek = userOptions === null || userOptions === void 0 ? void 0 : userOptions.seek) !== null && _userOptions$seek !== void 0 ? _userOptions$seek : defaultOptions.seek);
  const volume = useOption((_userOptions$volume = userOptions === null || userOptions === void 0 ? void 0 : userOptions.volume) !== null && _userOptions$volume !== void 0 ? _userOptions$volume : defaultOptions.volume);
  const currentFrame = Rea.useSharedValue(null);
  const currentTime = Rea.useSharedValue(0);
  const lastTimestamp = Rea.useSharedValue(-1);
  const duration = useMemo(() => {
    var _video$duration;
    return (_video$duration = video === null || video === void 0 ? void 0 : video.duration()) !== null && _video$duration !== void 0 ? _video$duration : 0;
  }, [video]);
  const framerate = useMemo(() => {
    var _video$framerate;
    return Platform.OS === "web" ? -1 : (_video$framerate = video === null || video === void 0 ? void 0 : video.framerate()) !== null && _video$framerate !== void 0 ? _video$framerate : 0;
  }, [video]);
  const size = useMemo(() => {
    var _video$size;
    return (_video$size = video === null || video === void 0 ? void 0 : video.size()) !== null && _video$size !== void 0 ? _video$size : {
      width: 0,
      height: 0
    };
  }, [video]);
  const rotation = useMemo(() => {
    var _video$rotation;
    return (_video$rotation = video === null || video === void 0 ? void 0 : video.rotation()) !== null && _video$rotation !== void 0 ? _video$rotation : 0;
  }, [video]);
  const frameDuration = 1000 / framerate;
  const currentFrameDuration = Math.floor(frameDuration);
  Rea.useAnimatedReaction(() => isPaused.value, paused => {
    if (paused) {
      video === null || video === void 0 || video.pause();
    } else {
      lastTimestamp.value = -1;
      video === null || video === void 0 || video.play();
    }
  });
  Rea.useAnimatedReaction(() => seek.value, value => {
    if (value !== null) {
      video === null || video === void 0 || video.seek(value);
      currentTime.value = value;
      seek.value = null;
    }
  });
  Rea.useAnimatedReaction(() => volume.value, value => {
    video === null || video === void 0 || video.setVolume(value);
  });
  Rea.useFrameCallback(frameInfo => {
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
      seek.value = 0;
      currentTime.value = seek.value;
      lastTimestamp.value = currentTimestamp;
    }
    // On Web the framerate is uknown.
    // This could be optimized by using requestVideoFrameCallback (Chrome only)
    if (delta >= currentFrameDuration && !isOver || Platform.OS === "web") {
      setFrame(video, currentFrame);
      currentTime.value += delta;
      lastTimestamp.value = currentTimestamp;
    }
  });
  useEffect(() => {
    return () => {
      // TODO: should video simply be a shared value instead?
      Rea.runOnUI(disposeVideo)(video);
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
//# sourceMappingURL=useVideo.js.map