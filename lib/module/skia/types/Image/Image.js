export let FilterMode = /*#__PURE__*/function (FilterMode) {
  FilterMode[FilterMode["Nearest"] = 0] = "Nearest";
  FilterMode[FilterMode["Linear"] = 1] = "Linear";
  return FilterMode;
}({});
export let MipmapMode = /*#__PURE__*/function (MipmapMode) {
  MipmapMode[MipmapMode["None"] = 0] = "None";
  MipmapMode[MipmapMode["Nearest"] = 1] = "Nearest";
  MipmapMode[MipmapMode["Linear"] = 2] = "Linear";
  return MipmapMode;
}({});
export let ImageFormat = /*#__PURE__*/function (ImageFormat) {
  ImageFormat[ImageFormat["JPEG"] = 3] = "JPEG";
  ImageFormat[ImageFormat["PNG"] = 4] = "PNG";
  ImageFormat[ImageFormat["WEBP"] = 6] = "WEBP";
  return ImageFormat;
}({});
export const isCubicSampling = sampling => {
  "worklet";

  return "B" in sampling && "C" in sampling;
};
export const MitchellCubicSampling = {
  B: 1 / 3.0,
  C: 1 / 3.0
};
export const CatmullRomCubicSampling = {
  B: 0,
  C: 1 / 2.0
};
export const CubicSampling = {
  B: 0,
  C: 0
};
export const MakeCubic = (B, C) => ({
  B,
  C
});
//# sourceMappingURL=Image.js.map