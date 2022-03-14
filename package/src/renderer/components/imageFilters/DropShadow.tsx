import React from "react";

import { Skia, processColor } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors";
import type { Color } from "../../../skia";

import { getInput } from "./getInput";

export interface DropShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: Color;
  shadowOnly?: boolean;
}

export const DropShadow = (props: AnimatedProps<DropShadowProps>) => {
  const declaration = useDeclaration(
    props,
    ({ dx, dy, blur, color, shadowOnly }, children, { opacity }) => {
      const input = getInput(children);
      const cl = processColor(color, opacity);
      const factory = shadowOnly
        ? Skia.ImageFilter.MakeDropShadowOnly
        : Skia.ImageFilter.MakeDropShadow;
      return factory(dx, dy, blur, blur, cl, input);
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
