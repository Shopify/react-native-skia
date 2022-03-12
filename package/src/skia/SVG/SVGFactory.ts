import type { Data } from "../Data/Data";

import type { SkSVG } from "./SVG";

export interface SVGFactory {
  MakeFromData(data: Data): SkSVG | null;
  MakeFromString(str: string): SkSVG | null;
}
