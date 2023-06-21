import type { SkFontMgr } from "./Font";

export interface SkFontMgrFactory {
  MakeFromData(...buffers: ArrayBuffer[]): SkFontMgr;
  getInstance(): SkFontMgr;
}
