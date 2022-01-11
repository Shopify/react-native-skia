import type { Data } from "../Data";

import type { FontMgr } from "./FontMgr";

export interface FontMgrFactory {
  FromData: (...data: Data[]) => FontMgr | null;
}
