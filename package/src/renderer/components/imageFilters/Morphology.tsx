import React from "react";

import type { MorphologyImageFilterProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors";

export const Morphology = ({
  operator = "dilate",
  ...props
}: SkiaDefaultProps<MorphologyImageFilterProps, "operator">) => {
  return <skMorphologyImageFilter operator={operator} {...props} />;
};
