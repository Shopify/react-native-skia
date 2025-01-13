import React from "react";

import type { ImageShaderProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors";

export const ImageShader = ({
  tx = "decal",
  ty = "decal",
  fit = "none",
  transform = [],
  ...props
}: SkiaDefaultProps<ImageShaderProps, "tx" | "ty" | "fit" | "transform">) => {
  return (
    <skImageShader tx={tx} ty={ty} fit={fit} transform={transform} {...props} />
  );
};
