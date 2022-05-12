import { Platform, processColor as processColorRN } from "react-native";

import { Skia } from "./Skia";

// This is the JSI color
export type SkColor = number;
// Input colors can be string or number
export type Color = string | number;

/*
 * Parse CSS colors
 */
export const Color = (cl: Color): number => {
  if (typeof cl === "number") {
    return cl;
  }
  const color = Skia.parseColorString(cl);
  if (color !== undefined) {
    return color;
  } else {
    // If the color is not recognized, we fallback to React Native
    let rnColor = processColorRN(cl);
    // 1. Neither Skia or RN could parse the color
    if (typeof rnColor !== "number") {
      console.warn("Skia couldn't parse the following color " + cl);
      return 0xff000000;
      // 2. The color is recognized by RN but not by Skia
    } else {
      console.warn(
        "Skia couldn't parse the following color " +
          cl +
          ". The color parsing was delegated to React Native. Please file on issue with that color."
      );
      // On android we need to move the alpha byte to the start of the structure
      if (Platform.OS === "android") {
        rnColor = rnColor >>> 0;
        const a = (rnColor >> 24) & 0xff;
        const r = (rnColor >> 16) & 0xff;
        const g = (rnColor >> 8) & 0xff;
        const b = rnColor & 0xff;
        rnColor = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
      }
      return rnColor;
    }
  }
};

export const alphaf = (c: number) => ((c >> 24) & 255) / 255;
export const red = (c: number) => (c >> 16) & 255;
export const green = (c: number) => (c >> 8) & 255;
export const blue = (c: number) => c & 255;
export const rgbaColor = (r: number, g: number, b: number, af: number) => {
  const a = Math.round(af * 255);
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
};

const processColorAsArray = (cl: Color) => {
  const icl = typeof cl === "string" ? Color(cl) : cl;
  const r = red(icl);
  const g = green(icl);
  const b = blue(icl);
  const a = alphaf(icl);
  return [r, g, b, a] as const;
};

export const processColor = (cl: Color, currentOpacity: number) => {
  const [r, g, b, a] = processColorAsArray(cl);
  return rgbaColor(r, g, b, a * currentOpacity);
};

export const processColorAsUnitArray = (cl: Color, currentOpacity: number) => {
  const [r, g, b, a] = processColorAsArray(cl);
  return [r / 255, g / 255, b / 255, a * currentOpacity] as const;
};
