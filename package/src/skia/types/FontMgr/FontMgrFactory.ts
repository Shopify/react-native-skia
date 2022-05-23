import type { FontMgr } from "./FontMgr";

// Commented code below is the CanvasKit reference
export interface FontMgrFactory {
  // FromData: (...data: Data[]) => FontMgr | null;
  RefDefault: () => FontMgr;
}

//const fontMgrFactory = (data: Data[]) => Skia.FontMgr.FromData(...data);

// export const useFontMgr = (data: DataSource[], deps: DependencyList = []) =>
//   useDataCollection(data, fontMgrFactory, deps);
