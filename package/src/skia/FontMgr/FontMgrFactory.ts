// import type { DependencyList } from "react";

// import type { Data, DataSource } from "../Data";
// import { useDataCollection } from "../Data/Data";
// import { Skia } from "../Skia";

import type { FontMgr } from "./FontMgr";

export interface FontMgrFactory {
  // FromData: (...data: Data[]) => FontMgr | null;
  RefDefault: () => FontMgr;
}

//const fontMgrFactory = (data: Data[]) => Skia.FontMgr.FromData(...data);

// export const useFontMgr = (data: DataSource[], deps: DependencyList = []) =>
//   useDataCollection(data, fontMgrFactory, deps);
