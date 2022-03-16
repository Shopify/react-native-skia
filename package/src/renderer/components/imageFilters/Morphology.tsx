import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps, Radius } from "../../processors";
import { processRadius } from "../../processors/Radius";

import { getInput } from "./getInput";

export interface MorphologyProps {
  operator: "erode" | "dilate";
  radius: Radius;
  children?: React.ReactNode | React.ReactNode[];
}

export const Morphology = (props: AnimatedProps<MorphologyProps>) => {
  const declaration = useDeclaration(
    props,
    ({ radius, operator }, children) => {
      const input = getInput(children);
      const r = processRadius(radius);
      const factory =
        operator === "dilate"
          ? Skia.ImageFilter.MakeDilate
          : Skia.ImageFilter.MakeErode;
      return factory(r.x, r.y, input);
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

Morphology.defaultProps = {
  operator: "dilate",
};
