import React from "react";

import type { SkiaProps } from "../../processors";
import type { CircleProps } from "../../../dom/types";

export const Circle = (props: SkiaProps<CircleProps>) => {
  return <skCircle {...props} />;
};
