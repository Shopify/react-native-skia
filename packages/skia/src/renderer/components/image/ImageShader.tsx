import React from "react";

import type { ImageShaderProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors";

export const ImageShader = ({
  tx = "decal",
  ty = "decal",
  fm = "nearest",
  mm = "none",
  fit = "none",
  transform = [],
  ...props
}: SkiaDefaultProps<
  ImageShaderProps,
  "tx" | "ty" | "fm" | "mm" | "fit" | "transform"
>) => {
  return (
    <skImageShader
      tx={tx}
      ty={ty}
      fm={fm}
      mm={mm}
      fit={fit}
      transform={transform}
      {...props}
    />
  );
};
