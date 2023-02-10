import React from "react";

import type { SkiaDefaultProps } from "../../processors/Animations/Animations";
import type { BlurImageFilterProps } from "../../../dom/types";

export const Blur = ({
  mode = "decal",
  ...props
}: SkiaDefaultProps<BlurImageFilterProps, "mode">) => {
  return <skBlurImageFilter mode={mode} {...props} />;
};
