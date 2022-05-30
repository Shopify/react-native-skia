import type { Data } from "../Data";

import type { SkTypeface } from "./Typeface";

export interface TypefaceFactory {
  MakeFreeTypeFaceFromData(data: Data): SkTypeface | null;
}
