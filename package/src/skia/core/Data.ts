import { useEffect, useState } from "react";
import { Image, Platform } from "react-native";

import { Skia } from "../Skia";
import type { SkData, DataSource } from "../types";

const resolveAsset = (source: ReturnType<typeof require>) => {
  return Platform.OS === "web"
    ? source.default
    : Image.resolveAssetSource(source).uri;
};

const factoryWrapper = <T>(
  data2: SkData,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => {
  const factoryResult = factory(data2);
  if (factoryResult === null) {
    onError && onError(new Error("Could not load data"));
    return null;
  } else {
    return factoryResult;
  }
};

const loadDataCollection = <T>(
  sources: DataSource[],
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
): Promise<(T | null)[]> =>
  Promise.all(sources.map((source) => loadData(source, factory, onError)));

const loadData = <T>(
  source: DataSource,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
): Promise<T | null> => {
  if (source === null) {
    return new Promise((resolve) => resolve(null));
  } else if (source instanceof Uint8Array) {
    return new Promise((resolve) =>
      resolve(factoryWrapper(Skia.Data.fromBytes(source), factory, onError))
    );
  } else {
    const uri = typeof source === "string" ? source : resolveAsset(source);
    return Skia.Data.fromURI(uri).then((d) =>
      factoryWrapper(d, factory, onError)
    );
  }
};

type Source = DataSource | null | undefined;

const useLoading = <T>(source: Source, loader: () => Promise<T | null>) => {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    if (source === null) {
      setData(null);
    } else {
      loader().then(setData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
  return data;
};

export const useDataCollection = <T>(
  sources: DataSource[],
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => useLoading(sources, () => loadDataCollection(sources, factory, onError));

export const useRawData = <T>(
  source: DataSource | null | undefined,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => useLoading(source, () => loadData(source, factory, onError));

const identity = (data: SkData) => data;

export const useData = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRawData(source, identity, onError);
