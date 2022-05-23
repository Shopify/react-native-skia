import type { SkData } from "../Data/SkData";

import type { SkSVG } from "./SVG";

export interface SVGFactory {
  MakeFromData(data: SkData): SkSVG | null;
  MakeFromString(str: string): SkSVG | null;
}
