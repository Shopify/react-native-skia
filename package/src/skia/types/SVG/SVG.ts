import type { JsiDisposable, SkJSIInstance } from "../JsiInstance";

export interface SkSVG extends SkJSIInstance<"SVG">, JsiDisposable {
  width(): number;
  height(): number;
}
