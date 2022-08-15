import type { DependencyList } from "react";
import { useRef, useEffect, useState } from "react";
import { Image } from "react-native";

import { Skia } from "../Skia";
import { isRNModule } from "../types";
import type { SkData, DataModule, DataSourceFromHook } from "../types";

const resolveAsset = (source: DataModule) => {
  return isRNModule(source)
    ? Image.resolveAssetSource(source).uri
    : source.default;
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

const loadData = <T>(
  source: DataSourceFromHook,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
): Promise<T | null> => {
  if (source === null || source === undefined) {
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
const useLoading = <T>(
  source: DataSourceFromHook,
  loader: () => Promise<T | null>,
  deps: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const prevSourceRef = useRef<DataSourceFromHook>();
  useEffect(() => {
    if (prevSourceRef.current !== source) {
      prevSourceRef.current = source;
      loader().then(setData);
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
};

export const useRawData = <T>(
  source: DataSourceFromHook,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void,
  deps?: DependencyList
) => useLoading(source, () => loadData(source, factory, onError), deps);

const identity = (data: SkData) => data;

export const useData = (
  source: DataSourceFromHook,
  onError?: (err: Error) => void,
  deps?: DependencyList
) => useRawData(source, identity, onError, deps);
