import type { SkColorFilter, Skia } from "../../../skia/types";
import { isColorFilter, isImageFilter } from "../../../skia/types";
import type { DeclarationResult } from "../../nodes";

export const composeColorFilter = (
  Skia: Skia,
  cf: SkColorFilter,
  children: DeclarationResult[]
) => {
  const [col] = children.filter(isColorFilter);
  const [img] = children.filter(isImageFilter);
  if (col) {
    return Skia.ColorFilter.MakeCompose(cf, col);
  } else if (img) {
    return Skia.ImageFilter.MakeColorFilter(cf, img);
  }
  return cf;
};
