import React from "react";

import type { SkiaDefaultProps } from "../../processors/Animations/Animations";
import type { PointsProps } from "../../../dom/types";

export const Points = ({
  mode = "points",
  ...props
}: SkiaDefaultProps<PointsProps, "mode">) => {
  return <skPoints mode={mode} {...props} />;
};
