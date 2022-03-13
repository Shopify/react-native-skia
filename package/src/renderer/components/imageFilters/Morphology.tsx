import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors";

import { getInput } from "./getInput";

export interface MorphologyProps {
  operator: "erode" | "dilate";
  radius: number;
  children: React.ReactNode | React.ReactNode[];
}

export const Morphology = (props: AnimatedProps<MorphologyProps>) => {
  const declaration = useDeclaration(
    props,
    ({ radius, operator }, children) => {
      const input = getInput(children);
      const factory =
        operator === "dilate"
          ? Skia.ImageFilter.MakeDilate
          : Skia.ImageFilter.MakeErode;
      return factory(radius, radius, input);
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

Morphology.defaultProps = {
  operator: "dilate",
};
