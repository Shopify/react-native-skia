import type { SkData, DataSourceParam, SkJSIInstance } from "../types";
export declare const loadData: <T>(source: DataSourceParam, factory: (data: SkData) => T | null, onError?: (err: Error) => void) => Promise<T | null>;
export declare const useCollectionLoading: <T extends SkJSIInstance<string>>(source: DataSourceParam[], loader: () => Promise<(T | null)[]>) => T[] | null;
export declare const useRawData: <T extends SkJSIInstance<string>>(source: DataSourceParam, factory: (data: SkData) => T | null, onError?: (err: Error) => void) => T | null;
export declare const useData: (source: DataSourceParam, onError?: (err: Error) => void) => SkData | null;
