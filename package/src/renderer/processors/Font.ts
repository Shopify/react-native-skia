import type { SkFont } from "../../skia";
import { Skia } from "../../skia/Skia";
import type { FontMgr } from "../../skia/FontMgr/FontMgr";

export type FontDef = { font: SkFont } | { familyName: string; size: number };

export const isFont = (fontDef: FontDef): fontDef is { font: SkFont } =>
  // We use any here for safety (JSI instances don't have hasProperty working properly);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fontDef as any).font !== undefined;

export const processFont = (fontMgr: FontMgr, fontDef: FontDef) => {
  let selectedFont: SkFont;
  if (isFont(fontDef)) {
    selectedFont = fontDef.font;
  } else {
    const { familyName, size } = fontDef;
    const typeface = fontMgr.matchFamilyStyle(familyName);
    if (typeface === null) {
      throw new Error(`No typeface found for ${familyName}`);
    }
    selectedFont = Skia.Font(typeface, size);
  }
  return selectedFont;
};
