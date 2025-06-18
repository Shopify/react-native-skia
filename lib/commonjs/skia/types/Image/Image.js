"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isCubicSampling = exports.MitchellCubicSampling = exports.MipmapMode = exports.MakeCubic = exports.ImageFormat = exports.FilterMode = exports.CubicSampling = exports.CatmullRomCubicSampling = void 0;
let FilterMode = exports.FilterMode = /*#__PURE__*/function (FilterMode) {
  FilterMode[FilterMode["Nearest"] = 0] = "Nearest";
  FilterMode[FilterMode["Linear"] = 1] = "Linear";
  return FilterMode;
}({});
let MipmapMode = exports.MipmapMode = /*#__PURE__*/function (MipmapMode) {
  MipmapMode[MipmapMode["None"] = 0] = "None";
  MipmapMode[MipmapMode["Nearest"] = 1] = "Nearest";
  MipmapMode[MipmapMode["Linear"] = 2] = "Linear";
  return MipmapMode;
}({});
let ImageFormat = exports.ImageFormat = /*#__PURE__*/function (ImageFormat) {
  ImageFormat[ImageFormat["JPEG"] = 3] = "JPEG";
  ImageFormat[ImageFormat["PNG"] = 4] = "PNG";
  ImageFormat[ImageFormat["WEBP"] = 6] = "WEBP";
  return ImageFormat;
}({});
const isCubicSampling = sampling => {
  "worklet";

  return "B" in sampling && "C" in sampling;
};
exports.isCubicSampling = isCubicSampling;
const MitchellCubicSampling = exports.MitchellCubicSampling = {
  B: 1 / 3.0,
  C: 1 / 3.0
};
const CatmullRomCubicSampling = exports.CatmullRomCubicSampling = {
  B: 0,
  C: 1 / 2.0
};
const CubicSampling = exports.CubicSampling = {
  B: 0,
  C: 0
};
const MakeCubic = (B, C) => ({
  B,
  C
});
exports.MakeCubic = MakeCubic;
//# sourceMappingURL=Image.js.map