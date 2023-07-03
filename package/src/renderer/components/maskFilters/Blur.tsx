import React from "react";

import type { BlurMaskFilterProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors/Animations/Animations";

export const BlurMask = ({
  style = "normal",
  respectCTM = true,
  ...props
}: SkiaDefaultProps<BlurMaskFilterProps, "style" | "respectCTM">) => {
  return <skBlurMaskFilter style={style} respectCTM={respectCTM} {...props} />;
};
