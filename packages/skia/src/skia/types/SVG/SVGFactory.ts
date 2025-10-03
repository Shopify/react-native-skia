import type { SkData } from "../Data";
import type { SkFontMgr } from "../Font/FontMgr";

import type { SkSVG } from "./SVG";

export interface SVGFactory {
  MakeFromData(
    data: SkData,
    fontMgr?: SkFontMgr | null,
    assets?: Record<string, SkData | null>
  ): SkSVG | null;
  MakeFromString(
    str: string,
    fontMgr?: SkFontMgr | null,
    assets?: Record<string, SkData | null>
  ): SkSVG | null;
}
