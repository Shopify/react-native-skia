import React from "react";

import type { FractalNoiseProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors/Animations/Animations";

export const FractalNoise = ({
  seed = 0,
  tileWidth = 0,
  tileHeight = 0,
  ...props
}: SkiaDefaultProps<
  FractalNoiseProps,
  "seed" | "tileHeight" | "tileWidth"
>) => {
  return (
    <skFractalNoise
      seed={seed}
      tileWidth={tileWidth}
      tileHeight={tileHeight}
      {...props}
    />
  );
};
