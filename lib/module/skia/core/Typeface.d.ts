import type { DataSourceParam } from "../types";
/**
 * Returns a Skia Typeface object
 * */
export declare const useTypeface: (source: DataSourceParam, onError?: (err: Error) => void) => import("../types").SkTypeface | null;
