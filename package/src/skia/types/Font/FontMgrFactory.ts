import type { SkData } from "../Data";

import type { SkFontMgr } from "./Font";

export interface SkFontMgrFactory {
  FromData(data: SkData[]): SkFontMgr;
  System(): SkFontMgr;
}
