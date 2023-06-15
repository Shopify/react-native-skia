import { useEffect, useRef, useState } from "react";

import { Skia } from "../Skia";
import type { SkData, DataSourceParam, BaseSkJSIInstance } from "../types";
import { Platform } from "../../Platform";

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
  source: DataSourceParam,
  factory: (data: SkData) => T | null,
  onError?: (err: Error) => void
): Promise<T | null> => {
  if (source === null || source === undefined) {
    return new Promise((resolve) => resolve(null));
  } else if (source instanceof Uint8Array) {
    return new Promise((resolve) =>
      resolve(factoryWrapper(Skia.Data.fromBytes(source), factory, onError))
    );
  } else {
    const uri =
      typeof source === "string" ? source : Platform.resolveAsset(source);
    return Skia.Data.fromURI(uri).then((d) =>
      factoryWrapper(d, factory, onError)
    );
  }
};
const useLoading = <T extends BaseSkJSIInstance>(
  source: DataSourceParam,
  loader: () => Promise<T | null>
) => {
  const mounted = useRef(false);
  const [data, setData] = useState<T | null>(null);
  const dataRef = useRef<T | null>(null);
  useEffect(() => {
    mounted.current = true;
    loader().then((value) => {
      if (mounted.current) {
        setData(value);
        dataRef.current = value;
      }
    });
    return () => {
      dataRef.current?.dispose();
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);
  return data;
};

export const useRawData = <T extends BaseSkJSIInstance>(
  source: DataSourceParam,
  factory: (data: SkData) => T | null,
  onError?: (err: Error) => void
) => useLoading(source, () => loadData<T>(source, factory, onError));

const identity = (data: SkData) => data;

export const useData = (
  source: DataSourceParam,
  onError?: (err: Error) => void
) => useRawData(source, identity, onError);
