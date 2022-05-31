import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps, Radius } from "../../processors";
import { processRadius } from "../../processors/Radius";

import { getInput } from "./getInput";

export interface MorphologyProps {
  operator: "erode" | "dilate";
  radius: Radius;
  children?: React.ReactNode | React.ReactNode[];
}

const onDeclare = createDeclaration<MorphologyProps>(
  ({ radius, operator }, children, { Skia }) => {
    const input = getInput(Skia, children);
    const r = processRadius(Skia, radius);
    const factory =
      operator === "dilate"
        ? Skia.ImageFilter.MakeDilate
        : Skia.ImageFilter.MakeErode;
    return factory(r.x, r.y, input);
  }
);

export const Morphology = (props: AnimatedProps<MorphologyProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Morphology.defaultProps = {
  operator: "dilate",
};
