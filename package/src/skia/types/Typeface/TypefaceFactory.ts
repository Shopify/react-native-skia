import type { SkData } from "../Data/SkData";

import type { SkTypeface } from "./Typeface";

export interface TypefaceFactory {
  MakeFreeTypeFaceFromData(data: SkData): SkTypeface | null;
}
