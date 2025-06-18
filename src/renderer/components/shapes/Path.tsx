import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { PathProps } from "../../../dom/types";

export const Path = ({
  start = 0,
  end = 1,
  ...props
}: SkiaDefaultProps<PathProps, "start" | "end">) => {
  return <skPath start={start} end={end} {...props} />;
};
