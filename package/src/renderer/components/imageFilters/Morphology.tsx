import React from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors";

import { getInput } from "./getInput";

export interface MorphologyProps {
  operator: "erode" | "dilate";
  radius: number;
  children: React.ReactNode | React.ReactNode[];
}

const onDeclare = createDeclaration<MorphologyProps>(
  ({ radius, operator }, children) => {
    const input = getInput(children);
    const factory =
      operator === "dilate"
        ? Skia.ImageFilter.MakeDilate
        : Skia.ImageFilter.MakeErode;
    return factory(radius, radius, input);
  }
);

export const Morphology = (props: AnimatedProps<MorphologyProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Morphology.defaultProps = {
  operator: "dilate",
};
