import type { SkJSIInstane } from "../JsiInstance";

export const isShader = (obj: SkJSIInstane<string> | null): obj is IShader =>
  obj !== null && obj.__typename__ === "Shader";

export type IShader = SkJSIInstane<"Shader">;
