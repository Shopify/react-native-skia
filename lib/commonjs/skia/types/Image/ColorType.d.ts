export declare enum ColorType {
    Unknown = 0,// uninitialized
    Alpha_8 = 1,// pixel with alpha in 8-bit byte
    RGB_565 = 2,// pixel with 5 bits red, 6 bits green, 5 bits blue, in 16-bit word
    ARGB_4444 = 3,// pixel with 4 bits for alpha, red, green, blue; in 16-bit word
    RGBA_8888 = 4,// pixel with 8 bits for red, green, blue, alpha; in 32-bit word
    RGB_888x = 5,// pixel with 8 bits each for red, green, blue; in 32-bit word
    BGRA_8888 = 6,// pixel with 8 bits for blue, green, red, alpha; in 32-bit word
    RGBA_1010102 = 7,// 10 bits for red, green, blue; 2 bits for alpha; in 32-bit word
    BGRA_1010102 = 8,// 10 bits for blue, green, red; 2 bits for alpha; in 32-bit word
    RGB_101010x = 9,// pixel with 10 bits each for red, green, blue; in 32-bit word
    BGR_101010x = 10,// pixel with 10 bits each for blue, green, red; in 32-bit word
    BGR_101010x_XR = 11,// pixel with 10 bits each for blue, green, red; in 32-bit word, extended range
    BGRA_10101010_XR = 12,// pixel with 10 bits each for blue, green, red, alpha; in 64-bit word, extended range
    RGBA_10x6 = 13,// pixel with 10 used bits (most significant) followed by 6 unused
    Gray_8 = 14,// pixel with grayscale level in 8-bit byte
    RGBA_F16Norm = 15,// pixel with half floats in [0,1] for red, green, blue, alpha; in 64-bit word
    RGBA_F16 = 16,// pixel with half floats for red, green, blue, alpha; in 64-bit word
    RGB_F16F16F16x = 17,// pixel with half floats for red, green, blue; in 64-bit word
    RGBA_F32 = 18
}
