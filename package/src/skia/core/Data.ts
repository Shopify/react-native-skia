import type { DependencyList } from "react";
import { Image } from "react-native";

import { Skia } from "../Skia";
import type { SkData, DataSource } from "../types";
import { useRawDataCollection } from "../types";
import { useRawData } from "../types/Data/Data";

const resolve = (source: DataSource) =>
  typeof source === "string" ? source : Image.resolveAssetSource(source).uri;

export const useRNDataCollection = <T>(
  sources: DataSource[],
  factory: (data: SkData[]) => T,
  deps: DependencyList = []
) =>
  useRawDataCollection(
    Skia,
    sources.map((source) => resolve(source)),
    factory,
    deps
  );

export const useRNData = <T>(
  source: DataSource | null | undefined,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => useRawData(Skia, resolve(source), factory, onError);

const identity = (data: SkData) => data;

export const useData = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRNData(source, identity, onError);
