import React from "react";

import type { TurbulenceProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors/Animations/Animations";

export const Turbulence = ({
  seed = 0,
  tileWidth = 0,
  tileHeight = 0,
  ...props
}: SkiaDefaultProps<TurbulenceProps, "seed" | "tileWidth" | "tileHeight">) => {
  return (
    <skTurbulence
      seed={seed}
      tileWidth={tileWidth}
      tileHeight={tileHeight}
      {...props}
    />
  );
};
