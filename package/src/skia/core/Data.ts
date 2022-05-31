import type { DependencyList } from "react";
import { useRef, useEffect, useState } from "react";
import { Image } from "react-native";

import { Skia } from "../Skia";
import type { SkData, DataSource } from "../types";

export const useDataCollection = <T>(
  sources: DataSource[],
  factory: (data: SkData[]) => T,
  deps: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const bytesOrURIs = sources.map((source) => {
      if (source instanceof Uint8Array) {
        return source;
      }
      return typeof source === "string"
        ? source
        : Image.resolveAssetSource(source).uri;
    });
    Promise.all(
      bytesOrURIs.map((bytesOrURI) =>
        bytesOrURI instanceof Uint8Array
          ? Skia.Data.fromBytes(bytesOrURI)
          : Skia.Data.fromURI(bytesOrURI)
      )
    ).then((d) => setData(factory(d)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return data;
};

export const useRawData = <T>(
  source: DataSource | null | undefined,
  factory: (data: SkData) => T,
  onError?: (err: Error) => void
) => {
  const [data, setData] = useState<T | null>(null);
  const prevSourceRef = useRef<DataSource | null | undefined>();
  useEffect(() => {
    // Track to avoid re-fetching the same data
    if (prevSourceRef.current !== source) {
      prevSourceRef.current = source;
      if (source !== null && source !== undefined) {
        const factoryWrapper = (data2: SkData) => {
          const factoryResult = factory(data2);
          if (factoryResult === null) {
            onError && onError(new Error("Could not load data"));
            setData(null);
          } else {
            setData(factoryResult);
          }
        };
        if (source instanceof Uint8Array) {
          factoryWrapper(Skia.Data.fromBytes(source));
        } else {
          const uri =
            typeof source === "string"
              ? source
              : Image.resolveAssetSource(source).uri;
          Skia.Data.fromURI(uri).then((d) => factoryWrapper(d));
        }
      }
    } else {
      setData(null);
    }
  }, [factory, onError, source]);
  return data;
};

const identity = (data: SkData) => data;

export const useData = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRawData(source, identity, onError);
