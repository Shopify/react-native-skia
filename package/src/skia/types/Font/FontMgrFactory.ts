import type { SkFontMgr } from "./FontMgr";

export interface SkFontMgrFactory {
  System(): SkFontMgr;
}
