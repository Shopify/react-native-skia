import type { FontStyle, SkFontMgr } from "./Font";

export interface WebFont {
  typeface: ArrayBuffer;
  familyName: string;
  fontStyle: FontStyle;
}

export interface SkFontMgrFactory {
  loadFontsOnWeb(...fonts: WebFont[]): SkFontMgr;
  getInstance(): SkFontMgr;
}
