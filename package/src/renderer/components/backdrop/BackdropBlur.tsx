import React from "react";

import { Fill } from "../shapes";
import type { Color } from "../../../skia";
import { Blur } from "../imageFilters";
import type { AnimatedProps } from "../../processors";

import type { BackdropFilterProps } from "./BackdropFilter";
import { BackdropFilter } from "./BackdropFilter";

interface BackdropBlurProps extends BackdropFilterProps {
  intensity: number;
  color?: Color;
}

export const BackdropBlur = ({
  intensity,
  color,
  children,
  ...props
}: AnimatedProps<BackdropBlurProps>) => {
  return (
    <BackdropFilter {...props}>
      <Blur sigmaX={intensity} sigmaY={intensity} />
      <Fill color={color} />
      {children}
    </BackdropFilter>
  );
};
