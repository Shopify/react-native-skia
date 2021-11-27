import type { SkJSIInstane } from "../JsiInstance";

export const isShader = (obj: SkJSIInstane<string>): obj is IShader =>
  obj.__typename__ === "Shader";

export type IShader = SkJSIInstane<"Shader">;
