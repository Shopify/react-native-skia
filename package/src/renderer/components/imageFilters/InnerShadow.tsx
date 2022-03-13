import type { ReactNode } from "react";
import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDeclaration } from "../../nodes/Declaration";
import { Skia } from "../../../skia/Skia";
import { BlendMode, processColor, TileMode } from "../../../skia";

import { getInput } from "./getInput";

interface InnerShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: string;
  children?: ReactNode | ReactNode[];
}

export const InnerShadow = (props: AnimatedProps<InnerShadowProps>) => {
  const declaration = useDeclaration(
    props,
    ({ dx, dy, blur, color }, children, { opacity }) => {
      const input = getInput(children);
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
      return Skia.ImageFilter.MakeCompose(
        input,
        Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4)
      );
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
