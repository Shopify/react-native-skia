import type { SkJSIInstane } from "../JsiInstance";

export const isColorFilter = (
  obj: SkJSIInstane<string> | null
): obj is IColorFilter => obj !== null && obj.__typename__ === "ColorFilter";

export type IColorFilter = SkJSIInstane<"ColorFilter">;
