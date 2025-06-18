export let ColorType = /*#__PURE__*/function (ColorType) {
  ColorType[ColorType["Unknown"] = 0] = "Unknown";
  // uninitialized
  ColorType[ColorType["Alpha_8"] = 1] = "Alpha_8";
  // pixel with alpha in 8-bit byte
  ColorType[ColorType["RGB_565"] = 2] = "RGB_565";
  // pixel with 5 bits red, 6 bits green, 5 bits blue, in 16-bit word
  ColorType[ColorType["ARGB_4444"] = 3] = "ARGB_4444";
  // pixel with 4 bits for alpha, red, green, blue; in 16-bit word
  ColorType[ColorType["RGBA_8888"] = 4] = "RGBA_8888";
  // pixel with 8 bits for red, green, blue, alpha; in 32-bit word
  ColorType[ColorType["RGB_888x"] = 5] = "RGB_888x";
  // pixel with 8 bits each for red, green, blue; in 32-bit word
  ColorType[ColorType["BGRA_8888"] = 6] = "BGRA_8888";
  // pixel with 8 bits for blue, green, red, alpha; in 32-bit word
  ColorType[ColorType["RGBA_1010102"] = 7] = "RGBA_1010102";
  // 10 bits for red, green, blue; 2 bits for alpha; in 32-bit word
  ColorType[ColorType["BGRA_1010102"] = 8] = "BGRA_1010102";
  // 10 bits for blue, green, red; 2 bits for alpha; in 32-bit word
  ColorType[ColorType["RGB_101010x"] = 9] = "RGB_101010x";
  // pixel with 10 bits each for red, green, blue; in 32-bit word
  ColorType[ColorType["BGR_101010x"] = 10] = "BGR_101010x";
  // pixel with 10 bits each for blue, green, red; in 32-bit word
  ColorType[ColorType["BGR_101010x_XR"] = 11] = "BGR_101010x_XR";
  // pixel with 10 bits each for blue, green, red; in 32-bit word, extended range
  ColorType[ColorType["BGRA_10101010_XR"] = 12] = "BGRA_10101010_XR";
  // pixel with 10 bits each for blue, green, red, alpha; in 64-bit word, extended range
  ColorType[ColorType["RGBA_10x6"] = 13] = "RGBA_10x6";
  // pixel with 10 used bits (most significant) followed by 6 unused
  ColorType[ColorType["Gray_8"] = 14] = "Gray_8";
  // pixel with grayscale level in 8-bit byte
  ColorType[ColorType["RGBA_F16Norm"] = 15] = "RGBA_F16Norm";
  // pixel with half floats in [0,1] for red, green, blue, alpha; in 64-bit word
  ColorType[ColorType["RGBA_F16"] = 16] = "RGBA_F16";
  // pixel with half floats for red, green, blue, alpha; in 64-bit word
  ColorType[ColorType["RGB_F16F16F16x"] = 17] = "RGB_F16F16F16x";
  // pixel with half floats for red, green, blue; in 64-bit word
  ColorType[ColorType["RGBA_F32"] = 18] = "RGBA_F32"; // pixel using C float for red, green, blue, alpha; in 128-bit word
  return ColorType;
}({});
//# sourceMappingURL=ColorType.js.map