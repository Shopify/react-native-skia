import React from "react";

import { Blur } from "../imageFilters";
import type { AnimatedProps } from "../../processors";

import type { BackdropFilterProps } from "./BackdropFilter";
import { BackdropFilter } from "./BackdropFilter";

interface BackdropBlurProps extends Omit<BackdropFilterProps, "filter"> {
  intensity: number;
}

export const BackdropBlur = ({
  intensity,
  color,
  children,
  ...props
}: AnimatedProps<BackdropBlurProps>) => {
  return (
    <BackdropFilter
      filter={<Blur sigmaX={intensity} sigmaY={intensity} />}
      {...props}
    >
      {children}
    </BackdropFilter>
  );
};
