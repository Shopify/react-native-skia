import type { SkJSIInstance } from "../JsiInstance";
export interface SkSVG extends SkJSIInstance<"SVG"> {
    width(): number;
    height(): number;
}
