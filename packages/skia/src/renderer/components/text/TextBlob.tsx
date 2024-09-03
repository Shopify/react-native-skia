import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { TextBlobProps } from "../../../dom/types";

export const TextBlob = ({
  x = 0,
  y = 0,
  ...props
}: SkiaDefaultProps<TextBlobProps, "x" | "y">) => {
  return <skTextBlob x={x} y={y} {...props} />;
};
