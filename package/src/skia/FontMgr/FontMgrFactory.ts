import type { Data, DataSource } from "../Data";
import { useDataCollection } from "../Data/Data";
import { Skia } from "../Skia";

import type { FontMgr } from "./FontMgr";

export interface FontMgrFactory {
  FromData: (...data: Data[]) => FontMgr | null;
  RefDefault: () => FontMgr;
}

const fontMgrFactory = (data: Data[]) => Skia.FontMgr.FromData(...data);

export const useFontMgr = (data: DataSource[]) =>
  useDataCollection(data, fontMgrFactory);
