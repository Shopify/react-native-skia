import { Platform, processColor } from "react-native";

export type Color = number;

export const Color = (color?: number | string): Color => {
  let processedColor = processColor(color);
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
