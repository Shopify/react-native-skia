import React from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { Color } from "../../../skia/Color";
import { processColor } from "../../../skia/Color";

import { getInput } from "./getInput";

export interface DropShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: Color;
  shadowOnly?: boolean;
}

const onDeclare = createDeclaration<DropShadowProps>(
  ({ dx, dy, blur, color, shadowOnly }, children, { opacity }) => {
    const input = getInput(children);
    const factory = shadowOnly
      ? Skia.ImageFilter.MakeDropShadowOnly
      : Skia.ImageFilter.MakeDropShadow;
    return factory(dx, dy, blur, blur, processColor(color, opacity), input);
  }
);

export const DropShadow = (props: AnimatedProps<DropShadowProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
