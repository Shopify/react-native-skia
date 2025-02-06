import React from "react";

import type { SkiaProps } from "../../processors";
import type { ImageProps } from "../../../dom/types";

export const Image = ({ fit = "contain", ...props }: SkiaProps<ImageProps>) => {
  return <skImage fit={fit} {...props} />;
};
