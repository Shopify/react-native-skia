import type { SkJSIInstance } from "../JsiInstance";

export type SkData = SkJSIInstance<"Data">;

type RNModule = number;
type ESModule = {
  __esModule: true;
  default: string;
};
type MetroAsset = {
  uri: string;
  width: number;
  height: number;
};

export type DataModule = RNModule | ESModule | MetroAsset;
export type DataSource = DataModule | string | Uint8Array;
export type DataSourceParam = DataSource | null | undefined;

export const isRNModule = (mod: DataModule): mod is RNModule =>
  typeof mod === "number";
