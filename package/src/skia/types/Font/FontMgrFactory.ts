import type { SkFontMgr } from "./FontMgr";

export interface FontMgrFactory {
  System(): SkFontMgr;
}
