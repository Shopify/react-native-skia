import React from "react";

import { BlendMode, Skia, TileMode, processColor } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia";

import { getInput } from "./getInput";

export interface InnerShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: Color;
  shadowOnly?: boolean;
  inner?: boolean;
}

const onDeclare = createDeclaration<InnerShadowProps>(
  ({ dx, dy, blur, color, shadowOnly }, children, { opacity }) => {
    const input = getInput(children);
    const cl = processColor(color, opacity);
    const sourceGraphic = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeBlend(0xff000000, BlendMode.Dst),
      null
    );
    const sourceAlpha = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeBlend(0xff000000, BlendMode.SrcIn),
      null
    );
    const f1 = Skia.ImageFilter.MakeColorFilter(
      Skia.ColorFilter.MakeBlend(cl, BlendMode.SrcOut),
      null
    );
    const f2 = Skia.ImageFilter.MakeOffset(dx, dy, f1);
    const f3 = Skia.ImageFilter.MakeBlur(blur, blur, TileMode.Decal, f2);
    const f4 = Skia.ImageFilter.MakeBlend(BlendMode.SrcIn, sourceAlpha, f3);
    if (shadowOnly) {
      return f4;
    }
    return Skia.ImageFilter.MakeCompose(
      input,
      Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, sourceGraphic, f4)
    );
  }
);

export const InnerShadow = (props: AnimatedProps<InnerShadowProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
