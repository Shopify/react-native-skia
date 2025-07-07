import React from "react";

import type { ImageFilterProps } from "../../dom/types";
import type { SkiaProps } from "../processors";

export const ImageFilter = (props: SkiaProps<ImageFilterProps>) => {
  return <skImageFilter {...props} />;
};
