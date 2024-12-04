export enum ColorType {
  Unknown, // uninitialized
  Alpha_8, // pixel with alpha in 8-bit byte
  RGB_565, // pixel with 5 bits red, 6 bits green, 5 bits blue, in 16-bit word
  ARGB_4444, // pixel with 4 bits for alpha, red, green, blue; in 16-bit word
  RGBA_8888, // pixel with 8 bits for red, green, blue, alpha; in 32-bit word
  RGB_888x, // pixel with 8 bits each for red, green, blue; in 32-bit word
  BGRA_8888, // pixel with 8 bits for blue, green, red, alpha; in 32-bit word
  RGBA_1010102, // 10 bits for red, green, blue; 2 bits for alpha; in 32-bit word
  BGRA_1010102, // 10 bits for blue, green, red; 2 bits for alpha; in 32-bit word
  RGB_101010x, // pixel with 10 bits each for red, green, blue; in 32-bit word
  BGR_101010x, // pixel with 10 bits each for blue, green, red; in 32-bit word
  BGR_101010x_XR, // pixel with 10 bits each for blue, green, red; in 32-bit word, extended range
  BGRA_10101010_XR, // pixel with 10 bits each for blue, green, red, alpha; in 64-bit word, extended range
  RGBA_10x6, // pixel with 10 used bits (most significant) followed by 6 unused
  Gray_8, // pixel with grayscale level in 8-bit byte
  RGBA_F16Norm, // pixel with half floats in [0,1] for red, green, blue, alpha; in 64-bit word
  RGBA_F16, // pixel with half floats for red, green, blue, alpha; in 64-bit word
  RGB_F16F16F16x, // pixel with half floats for red, green, blue; in 64-bit word
  RGBA_F32, // pixel using C float for red, green, blue, alpha; in 128-bit word
}
