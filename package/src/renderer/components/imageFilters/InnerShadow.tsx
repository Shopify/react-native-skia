import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDeclaration } from "../../nodes/Declaration";
import { Skia } from "../../../skia/Skia";
import { BlendMode, processColor, TileMode } from "../../../skia";

interface InnerShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: string;
}

export const InnerShadow = (props: AnimatedProps<InnerShadowProps>) => {
  const declaration = useDeclaration(
    props,
    ({ dx, dy, blur, color }, _, { opacity }) => {
      const sourceGraphic = Skia.ImageFilter.MakeColorFilter(
        Skia.ColorFilter.MakeBlend(0xff000000, BlendMode.Dst),
        null
      );
      const sourceAlpha = Skia.ImageFilter.MakeColorFilter(
        Skia.ColorFilter.MakeBlend(0xff000000, BlendMode.SrcIn),
        null
      );
      const f1 = Skia.ImageFilter.MakeColorFilter(
        Skia.ColorFilter.MakeBlend(
          processColor(color, opacity),
          BlendMode.SrcOut
        ),
        null
      );
      const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
      const f3 = Skia.ImageFilter.MakeBlur(blur, blur, TileMode.Decal, f2);
      const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
      return Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4);
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
