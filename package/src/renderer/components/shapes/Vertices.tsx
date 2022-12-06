import React from "react";

import type { SkiaDefaultProps } from "../../processors";
import type { VerticesProps } from "../../../dom/types";

export const Vertices = ({
  mode = "triangles",
  ...props
}: SkiaDefaultProps<VerticesProps, "mode">) => {
  return <skVertices mode={mode} {...props} />;
};
