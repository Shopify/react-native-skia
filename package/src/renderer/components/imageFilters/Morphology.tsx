import React from "react";

import { processRadius } from "../../../dom/nodes/datatypes";
import type { Radius } from "../../../dom/types";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors";

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
        ? Skia.ImageFilter.MakeDilate.bind(Skia.ImageFilter)
        : Skia.ImageFilter.MakeErode.bind(Skia.ImageFilter);
    return factory(r.x, r.y, input);
  }
);

export const Morphology = (props: AnimatedProps<MorphologyProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

Morphology.defaultProps = {
  operator: "dilate",
};
