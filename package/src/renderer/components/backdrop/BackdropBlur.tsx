import React from "react";

import { Blur } from "../imageFilters";

import type { BackdropFilterProps } from "./BackdropFilter";
import { BackdropFilter } from "./BackdropFilter";

interface BackdropBlurProps extends Omit<BackdropFilterProps, "children"> {
  intensity: number;
}

export const BackdropBlur = ({ intensity, ...props }: BackdropBlurProps) => {
  return (
    <BackdropFilter {...props}>
      <Blur sigmaX={intensity} sigmaY={intensity} />
    </BackdropFilter>
  );
};
