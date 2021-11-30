import type { SkJSIInstance } from "../JsiInstance";

export const isShader = (obj: SkJSIInstance<string> | null): obj is IShader =>
  obj !== null && obj.__typename__ === "Shader";

export type IShader = SkJSIInstance<"Shader">;
