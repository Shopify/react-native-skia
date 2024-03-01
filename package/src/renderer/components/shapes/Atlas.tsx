import React from "react";

import type { AtlasProps } from "../../../dom/types";
import type { SkiaProps } from "../../processors";

export const Atlas = (props: SkiaProps<AtlasProps>) => {
  return <skAtlas {...props} />;
};
