import type { SkJSIInstance } from "../JsiInstance";
export declare const isColorFilter: (obj: SkJSIInstance<string> | null) => obj is SkColorFilter;
export type SkColorFilter = SkJSIInstance<"ColorFilter">;
