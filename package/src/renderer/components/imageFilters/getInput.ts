import type { DeclarationResult } from "../../nodes";
import type { Skia } from "../../../skia/types";
import { isImageFilter, isColorFilter, isShader } from "../../../skia/types";

export const getInput = (Skia: Skia, children: DeclarationResult[]) => {
  const [child] = children.filter((c) => c);
  if (!child) {
    return null;
  }
  if (isImageFilter(child)) {
    return child;
  }
  if (isColorFilter(child)) {
    return Skia.ImageFilter.MakeColorFilter(child, null);
  }
  if (isShader(child)) {
    return Skia.ImageFilter.MakeShader(child, null);
  }
  throw new Error("Invalid image filter child: " + child);
};
