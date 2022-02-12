import React from "react";

import { Blur } from "../imageFilters";

import type { BackdropProps } from "./Backdrop";
import { Backdrop } from "./Backdrop";

interface BackdropBlurProps extends Omit<BackdropProps, "children"> {
  intensity: number;
}

export const BackdropBlur = ({ intensity, ...props }: BackdropBlurProps) => {
  return (
    <Backdrop {...props}>
      <Blur sigmaX={intensity} sigmaY={intensity} />
    </Backdrop>
  );
};
