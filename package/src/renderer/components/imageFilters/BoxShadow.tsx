import React from "react";

import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDeclaration } from "../../nodes/Declaration";
import { Skia } from "../../../skia/Skia";
import { BlendMode, processColor, TileMode } from "../../../skia";

import { getInput } from "./getInput";

interface BoxShadowProps {
  dx: number;
  dy: number;
  blur: number;
  spread: number;
  color: string;
}

export const BoxShadow = (props: AnimatedProps<BoxShadowProps>) => {
  const declaration = useDeclaration(
    props,
    ({ dx, dy, blur, color, spread }, children, { opacity }) => {
      //const input = getInput(children);
      const bg = Skia.ImageFilter.MakeShader(
        Skia.Shader.MakeColor(processColor(color, opacity)),
        null
      );
      const f1 = Skia.ImageFilter.MakeErode(20, 20, null);
      const fg = Skia.ImageFilter.MakeBlur(blur, blur, TileMode.Decal, f1);
      return Skia.ImageFilter.MakeBlend(
        BlendMode.SrcOver,
        bg,
        Skia.ImageFilter.MakeBlend(BlendMode.SrcOver, bg, fg)
      );
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
