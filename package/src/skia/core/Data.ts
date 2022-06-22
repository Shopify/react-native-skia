import type { DependencyList } from "react";
import { useRef, useEffect, useState } from "react";
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
) => {
  const bytesOrURIs = sources.map((source) => {
    if (source instanceof Uint8Array) {
      return source;
    }
    return typeof source === "string" ? source : resolveAsset(source);
  });
  return Promise.all(
    bytesOrURIs.map((bytesOrURI) =>
      bytesOrURI instanceof Uint8Array
        ? factory(Skia.Data.fromBytes(bytesOrURI))
        : Skia.Data.fromURI(bytesOrURI).then((data) =>
            factoryWrapper(data, factory, onError)
          )
    )
  );
};

const loadData = <T>(
  source: DataSource,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => {
  if (source instanceof Uint8Array) {
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

const useLoading = <T>(
  source: Source,
  loader: () => Promise<T | null>,
  onError?: (err: Error) => void,
  deps: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const prevSourceRef = useRef<Source>();
  useEffect(() => {
    if (prevSourceRef.current !== source) {
      prevSourceRef.current = source;
      loader().then((result) => {
        if (result === null) {
          onError && onError(new Error("Could not load data"));
          setData(null);
        } else {
          setData(result);
        }
      });
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
};

export const useDataCollection = <T>(
  sources: DataSource[],
  factory: (data: SkData) => T,
  onError?: (err: Error) => void,
  deps?: DependencyList
) =>
  useLoading(
    sources,
    loadDataCollection.bind(null, sources, factory, onError, deps),
    onError,
    deps
  );

export const useRawData = <T>(
  source: DataSource | null | undefined,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void,
  deps?: DependencyList
) => useLoading(source, loadData.bind(null, source, factory, onError, deps));

const identity = (data: SkData) => data;

export const useData = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void,
  deps?: DependencyList
) => useRawData(source, identity, onError, deps);
