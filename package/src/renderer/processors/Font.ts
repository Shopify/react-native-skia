import type { SkFontMgr, SkFont, Skia } from "../../skia/types";

export type FontDef = { font: SkFont } | { familyName: string; size: number };

export const isFont = (fontDef: FontDef): fontDef is { font: SkFont } =>
  // We have an issue to check property existence on JSI backed instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (fontDef as any).font !== undefined;

export const processFont = (
  Skia: Skia,
  fontMgr: SkFontMgr,
  fontDef: FontDef
) => {
  let selectedFont: SkFont;
  if (isFont(fontDef)) {
    selectedFont = fontDef.font;
  } else {
    console.warn(
      // eslint-disable-next-line max-len
      "Using system fonts is deprecated. Please use the font property instead: https://shopify.github.io/react-native-skia/docs/text/fonts"
    );
    const { familyName, size } = fontDef;
    const typeface = fontMgr.matchFamilyStyle(familyName);
    if (typeface === null) {
      throw new Error(`No typeface found for ${familyName}`);
    }
    selectedFont = Skia.Font(typeface, size);
  }
  return selectedFont;
};
