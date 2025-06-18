"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useTextureValueFromPicture = exports.useTextureAsValue = exports.useTexture = exports.usePictureAsTexture = exports.useImageAsTexture = void 0;
var _react = require("react");
var _Offscreen = require("../../renderer/Offscreen");
var _skia = require("../../skia");
var _ReanimatedProxy = _interopRequireDefault(require("./ReanimatedProxy"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const createTexture = (texture, picture, size) => {
  "worklet";

  texture.value = (0, _Offscreen.drawAsImageFromPicture)(picture, size);
};
const useTexture = (element, size) => {
  const {
    width,
    height
  } = size;
  const picture = (0, _react.useMemo)(() => {
    return (0, _Offscreen.drawAsPicture)(element, {
      x: 0,
      y: 0,
      width,
      height
    });
  }, [element, width, height]);
  return usePictureAsTexture(picture, size);
};
exports.useTexture = useTexture;
const useTextureAsValue = (element, size) => {
  console.warn("useTextureAsValue has been renamed to use useTexture");
  return useTexture(element, size);
};
exports.useTextureAsValue = useTextureAsValue;
const useTextureValueFromPicture = (picture, size) => {
  console.warn("useTextureValueFromPicture has been renamed to use usePictureAsTexture");
  return usePictureAsTexture(picture, size);
};
exports.useTextureValueFromPicture = useTextureValueFromPicture;
const usePictureAsTexture = (picture, size) => {
  const texture = _ReanimatedProxy.default.useSharedValue(null);
  (0, _react.useEffect)(() => {
    if (picture !== null) {
      _ReanimatedProxy.default.runOnUI(createTexture)(texture, picture, size);
    }
  }, [texture, picture, size]);
  return texture;
};
exports.usePictureAsTexture = usePictureAsTexture;
const useImageAsTexture = source => {
  const image = (0, _skia.useImage)(source);
  const size = (0, _react.useMemo)(() => {
    if (image) {
      return {
        width: image.width(),
        height: image.height()
      };
    }
    return {
      width: 0,
      height: 0
    };
  }, [image]);
  const picture = (0, _react.useMemo)(() => {
    if (image) {
      const recorder = _skia.Skia.PictureRecorder();
      const canvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height
      });
      canvas.drawImage(image, 0, 0);
      return recorder.finishRecordingAsPicture();
    } else {
      return null;
    }
  }, [size, image]);
  return usePictureAsTexture(picture, size);
};
exports.useImageAsTexture = useImageAsTexture;
//# sourceMappingURL=textures.js.map