import type { IColorFilter } from "../../../skia";
import { isColorFilter, isImageFilter, Skia } from "../../../skia";
import type { DeclarationResult } from "../../nodes";

export const composeColorFilter = (
  cf: IColorFilter,
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
