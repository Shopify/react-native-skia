import React from "react";

import type { SkiaProps } from "../processors";
import type { DrawingNodeProps } from "../../dom/types";

export const Paint = (props: SkiaProps<DrawingNodeProps>) => {
  return <skPaint {...props} />;
};
