import { Platform } from "react-native";

interface ColorApi {
  parse: (color: string) => [number, number, number, number];
}

declare global {
  var ColorApi: ColorApi;
}

export const ColorApi: ColorApi = {
  parse: global.ColorApi.parse,
};

// This is the JSI color. Currently a number. This may change.
export type SkColor = number;

export type Color = string | number;

export const alphaf = (c: number) => ((c >> 24) & 255) / 255;
export const red = (c: number) => (c >> 16) & 255;
export const green = (c: number) => (c >> 8) & 255;
export const blue = (c: number) => c & 255;
export const rgbaColor = (r: number, g: number, b: number, af: number) => {
  const a = Math.round(af * 255);
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
};

const parse = (cl: Color) =>
  typeof cl === "string"
    ? ColorApi.parse(cl)
    : ([red(cl), green(cl), blue(cl), alphaf(cl)] as const);

export const processColorAsInt = (color?: number | string): SkColor => {
  let processedColor =
    typeof color === "string" ? rgbaColor(...parse(color)) : color;
  if (typeof processedColor !== "number") {
    throw new Error(`Couldn't process color: ${color}`);
  }
  // On android we need to move the alpha byte to the start of the structure
  if (Platform.OS === "android") {
    processedColor = processedColor >>> 0;
    const a = (processedColor >> 24) & 0xff;
    const r = (processedColor >> 16) & 0xff;
    const g = (processedColor >> 8) & 0xff;
    const b = processedColor & 0xff;
    processedColor = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }
  return processedColor;
};

export const processColor = (cl: Color, currentOpacity: number) => {
  const [r, g, b, a] = parse(cl);
  return rgbaColor(r, g, b, a * currentOpacity);
};

export const processColorAsUnitArray = (cl: Color, currentOpacity: number) => {
  const [r, g, b, a] = parse(cl);
  return [r / 255, g / 255, b / 255, a * currentOpacity] as const;
};
