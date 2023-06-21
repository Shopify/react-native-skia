import type { SkFontMgr } from "./Font";

export interface SkFontMgrFactory {
  initializeWithDataOnWeb(...buffers: ArrayBuffer[]): SkFontMgr;
  getInstance(): SkFontMgr;
}
