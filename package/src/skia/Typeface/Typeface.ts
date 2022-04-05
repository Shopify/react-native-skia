import type { SkJSIInstance } from "../JsiInstance";

export interface SkTypeface extends SkJSIInstance<"Typeface"> {
  readonly bold: boolean;
  readonly italic: boolean;
}
