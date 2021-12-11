import type { SkJSIInstance } from "../JsiInstance";

export const isColorFilter = (
  obj: SkJSIInstance<string> | null
): obj is IColorFilter => obj !== null && obj.__typename__ === "ColorFilter";

export type IColorFilter = SkJSIInstance<"ColorFilter">;
