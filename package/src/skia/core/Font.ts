/*global SkiaApi*/
import { useMemo } from "react";

import { Skia } from "../Skia";
import { FontSlant } from "../types";
import type { DataSourceParam, SkFontMgr } from "../types";
import { Platform } from "../../Platform";

import { useTypeface } from "./Typeface";
import { useDataCollection } from "./Data";

/**
 * Returns a Skia Font object
 * */
export const useFont = (
  font: DataSourceParam,
  size?: number,
  onError?: (err: Error) => void
) => {
  const typeface = useTypeface(font, onError);
  return useMemo(() => {
    if (typeface && size) {
      return Skia.Font(typeface, size);
    } else if (typeface && !size) {
      return Skia.Font(typeface);
    } else {
      return null;
    }
  }, [size, typeface]);
};

export const useFontMgr = (sources: DataSourceParam[]) => {
  const collection = useDataCollection(sources);
  return useMemo(() => {
    if (collection === null) {
      return null;
    }
    return collection;
  }, [collection]);
};

type Slant = "normal" | "italic" | "oblique";
type Weight =
  | "normal"
  | "bold"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

interface RNFontStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle: Slant;
  fontWeight: Weight;
}

const defaultFontStyle: RNFontStyle = {
  fontFamily: "System",
  fontSize: 14,
  fontStyle: "normal",
  fontWeight: "normal",
};

const slant = (s: Slant) => {
  if (s === "italic") {
    return FontSlant.Italic;
  } else if (s === "oblique") {
    return FontSlant.Oblique;
  } else {
    return FontSlant.Upright;
  }
};

const weight = (fontWeight: Weight) => {
  switch (fontWeight) {
    case "normal":
      return 400;
    case "bold":
      return 700;
    default:
      return parseInt(fontWeight, 10);
  }
};

export const matchFont = (
  inputStyle: Partial<RNFontStyle> = {},
  fontMgr: SkFontMgr = Skia.FontMgr.System()
) => {
  const fontStyle = {
    ...defaultFontStyle,
    ...inputStyle,
  };
  const style = {
    weight: weight(fontStyle.fontWeight),
    width: 5,
    slant: slant(fontStyle.fontStyle),
  };
  const name =
    Platform.OS === "android"
      ? fontStyle.fontFamily.toLowerCase()
      : fontStyle.fontFamily;
  const typeface = fontMgr.matchFamilyStyle(name, style);
  return Skia.Font(typeface, fontStyle.fontSize);
};
