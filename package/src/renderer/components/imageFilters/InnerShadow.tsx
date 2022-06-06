import type { SkColor, Skia, SkImageFilter } from "../../../skia/types";
import { BlendMode, TileMode } from "../../../skia/types";

const Black = Float32Array.of(0, 0, 0, 1);

export const MakeInnerShadow = (
  Skia: Skia,
  shadowOnly: boolean | undefined,
  dx: number,
  dy: number,
  sigmaX: number,
  sigmaY: number,
  color: SkColor,
  input: SkImageFilter | null
) => {
  const sourceGraphic = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.Dst),
    null
  );
  const sourceAlpha = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(Black, BlendMode.SrcIn),
    null
  );
  const f1 = Skia.ImageFilter.MakeColorFilter(
    Skia.ColorFilter.MakeBlend(color, BlendMode.SrcOut),
    null
  );
  const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
  const f3 = Skia.ImageFilter.MakeBlur(sigmaX, sigmaY, TileMode.Decal, f2);
  const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
  if (shadowOnly) {
    return f4;
  }
  return Skia.ImageFilter.MakeCompose(
    input,
    Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4)
  );
};
