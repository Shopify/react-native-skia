import React from "react";

import type { SkiaProps } from "../../processors";
import type { ImageProps } from "../../../dom/types";

export const Image = (props: SkiaProps<ImageProps>) => {
  return <skImage {...props} />;
};
