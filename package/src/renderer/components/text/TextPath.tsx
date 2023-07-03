import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { TextPathProps } from "../../../dom/types";

export const TextPath = ({
  initialOffset = 0,
  ...props
}: SkiaDefaultProps<TextPathProps, "initialOffset">) => {
  return <skTextPath initialOffset={initialOffset} {...props} />;
};
