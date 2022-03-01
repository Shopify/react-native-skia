import type { SkJSIInstance } from "../JsiInstance";

export interface ITypeface extends SkJSIInstance<"TypeFace"> {
  readonly bold: boolean;
  readonly italic: boolean;
}
