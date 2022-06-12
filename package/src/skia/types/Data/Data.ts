import type { DependencyList } from "react";
import { useEffect, useRef, useState } from "react";

import type { SkJSIInstance } from "../JsiInstance";
import type { Skia } from "../Skia";

export type SkData = SkJSIInstance<"Data">;

export type DataSource = ReturnType<typeof require> | string | Uint8Array;

export const useRawDataCollection = <T>(
  Skia: Skia,
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
      return source;
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
  Skia: Skia,
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
          Skia.Data.fromURI(source).then((d) => factoryWrapper(d));
        }
      } else {
        setData(null);
      }
    }
  }, [Skia.Data, factory, onError, source]);
  return data;
};
