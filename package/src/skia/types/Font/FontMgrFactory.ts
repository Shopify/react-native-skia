import type { SkFontMgr } from "./Font";

export interface SkFontMgrFactory {
  FromData(...data: ArrayBuffer[]): SkFontMgr;
  System(): SkFontMgr;
}
