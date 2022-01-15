import type { Data } from "../Data/Data";

import type { SVG } from "./SVG";

export interface SVGFactory {
  MakeFromData(data: Data): SVG | null;
  MakeFromString(str: string): SVG | null;
}
