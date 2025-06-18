import React from "react";

import type { SkiaDefaultProps } from "../../processors/Animations/Animations";
import type { DiscretePathEffectProps } from "../../../dom/types";

export const DiscretePathEffect = ({
  seed = 0,
  ...props
}: SkiaDefaultProps<DiscretePathEffectProps, "seed">) => {
  return <skDiscretePathEffect seed={seed} {...props} />;
};
