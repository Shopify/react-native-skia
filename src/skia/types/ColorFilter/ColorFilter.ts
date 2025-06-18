import type { SkJSIInstance } from "../JsiInstance";

export const isColorFilter = (
  obj: SkJSIInstance<string> | null
): obj is SkColorFilter => obj !== null && obj.__typename__ === "ColorFilter";

export type SkColorFilter = SkJSIInstance<"ColorFilter">;
