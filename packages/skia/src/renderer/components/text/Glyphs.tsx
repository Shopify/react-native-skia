import React from "react";

import type { GlyphsProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors/Animations/Animations";

export const Glyphs = ({
  x = 0,
  y = 0,
  ...props
}: SkiaDefaultProps<GlyphsProps, "x" | "y">) => {
  return <skGlyphs x={x} y={y} {...props} />;
};
