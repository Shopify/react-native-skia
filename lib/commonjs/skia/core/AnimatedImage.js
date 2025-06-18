"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useAnimatedImage = void 0;
var _Skia = require("../Skia");
var _Data = require("./Data");
const animatedImgFactory = _Skia.Skia.AnimatedImage.MakeAnimatedImageFromEncoded.bind(_Skia.Skia.AnimatedImage);

/**
 * Returns a Skia Animated Image object
 * */
const useAnimatedImage = (source, onError) => (0, _Data.useRawData)(source, animatedImgFactory, onError);
exports.useAnimatedImage = useAnimatedImage;
//# sourceMappingURL=AnimatedImage.js.map