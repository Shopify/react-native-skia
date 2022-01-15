import type { DependencyList } from "react";
import { useEffect, useState } from "react";
import { Image } from "react-native";

import type { SkJSIInstance } from "../JsiInstance";
import { Skia } from "../Skia";

export type Data = SkJSIInstance<"Data">;

export type DataSource = ReturnType<typeof require> | string;

export const useDataCollection = <T>(
  sources: DataSource[],
  factory: (data: Data[]) => T,
  deps: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const uris = sources.map((source) =>
      typeof source === "string" ? source : Image.resolveAssetSource(source).uri
    );
    Promise.all(uris.map((uri) => Skia.Data.fromURI(uri))).then((d) =>
      setData(factory(d))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
};

export const useRawData = <T>(
  source: DataSource,
  factory: (data: Data) => T
) => {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const uri =
      typeof source === "string"
        ? source
        : Image.resolveAssetSource(source).uri;
    Skia.Data.fromURI(uri).then((d) => setData(factory(d)));
  }, [factory, source]);
  return data;
};

const identity = (data: Data) => data;

export const useData = (source: DataSource) => useRawData(source, identity);
