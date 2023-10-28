/*global SkiaApi*/
import { useEffect, useMemo, useState } from "react";

import { Skia } from "../Skia";
import { FontSlant } from "../types";
import type { DataModule, DataSourceParam, SkFontMgr } from "../types";
import { Platform } from "../../Platform";
import type { SkTypefaceFontProvider } from "../types/Paragraph/TypefaceFontProvider";

import { useTypeface } from "./Typeface";

const defaultFontSize = 14;

/**
 * Returns a Skia Font object
 * */
export const useFont = (
  font: DataSourceParam,
  size = defaultFontSize,
  onError?: (err: Error) => void
) => {
  const typeface = useTypeface(font, onError);
  return useMemo(() => {
    if (typeface) {
      return Skia.Font(typeface, size);
    } else {
      return null;
    }
  }, [size, typeface]);
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
  fontSize: defaultFontSize,
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
  const typeface = fontMgr.matchFamilyStyle(fontStyle.fontFamily, style);
  return Skia.Font(typeface, fontStyle.fontSize);
};

export const listFontFamilies = (fontMgr: SkFontMgr = Skia.FontMgr.System()) =>
  new Array(fontMgr.countFamilies())
    .fill(0)
    .map((_, i) => fontMgr.getFamilyName(i));

const loadTypefaces = (typefacesToLoad: Record<string, DataModule[]>) => {
  const promises = Object.keys(typefacesToLoad).flatMap((familyName) => {
    return typefacesToLoad[familyName].map((typefaceToLoad) => {
      return Skia.Data.fromURI(Platform.resolveAsset(typefaceToLoad)).then(
        (data) => {
          const tf = Skia.Typeface.MakeFreeTypeFaceFromData(data);
          if (tf === null) {
            throw new Error(`Couldn't create typeface for ${familyName}`);
          }
          return [familyName, tf] as const;
        }
      );
    });
  });
  return Promise.all(promises);
};

export const useFonts = (sources: Record<string, DataModule[]>) => {
  const [fontMgr, setFontMgr] = useState<null | SkTypefaceFontProvider>(null);

  useEffect(() => {
    loadTypefaces(sources).then((result) => {
      const fMgr = Skia.TypefaceFontProvider.Make();
      result.forEach(([familyName, typeface]) => {
        fMgr.registerFont(typeface, familyName);
      });
      setFontMgr(fMgr);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return fontMgr;
};
