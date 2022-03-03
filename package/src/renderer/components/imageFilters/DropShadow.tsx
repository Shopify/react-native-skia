import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { IRect } from "../../../skia/Rect";
import type { Color } from "../../../skia/Color";
import { processColor } from "../../../skia/Color";

import { getInput } from "./getInput";

export interface DropShadowProps {
  dx: number;
  dy: number;
  sigmaX: number;
  sigmaY: number;
  color: Color;
  children?: ReactNode | ReactNode[];
  cropRect?: IRect;
  shadowOnly?: boolean;
}

export const DropShadow = (props: AnimatedProps<DropShadowProps>) => {
  const declaration = useDeclaration(
    props,
    (
      { dx, dy, sigmaX, sigmaY, color, shadowOnly, cropRect },
      children,
      { opacity }
    ) => {
      const input = getInput(children);
      const factory = shadowOnly
        ? Skia.ImageFilter.MakeDropShadowOnly
        : Skia.ImageFilter.MakeDropShadow;
      return factory(
        dx,
        dy,
        sigmaX,
        sigmaY,
        processColor(color, opacity),
        input,
        cropRect
      );
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

DropShadow.defaultProps = {
  mode: "decal",
};
