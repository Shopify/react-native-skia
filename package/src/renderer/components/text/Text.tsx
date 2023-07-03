import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { TextProps } from "../../../dom/types";

export const Text = ({
  x = 0,
  y = 0,
  ...props
}: SkiaDefaultProps<TextProps, "x" | "y">) => {
  return <skText x={x} y={y} {...props} />;
};
