import type { Data } from "../Data/Data";

import type { ITypeface } from "./Typeface";

export interface TypefaceFactory {
  MakeFreeTypeFaceFromData(data: Data): ITypeface | null;
}
