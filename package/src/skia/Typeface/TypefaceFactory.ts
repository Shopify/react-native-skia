import type { Data } from "../Data/Data";

import type { Typeface } from "./Typeface";

export interface TypefaceFactory {
  MakeFreeTypeFaceFromData(data: Data): Typeface | null;
}
