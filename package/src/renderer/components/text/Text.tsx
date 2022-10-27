import React from "react";

import type { SkiaProps } from "../../processors";
import type { SimpleTextProps } from "../../../dom/types";

export const SimpleText = (props: SkiaProps<SimpleTextProps>) => {
  return <skSimpleText {...props} />;
};

SimpleText.defaultProps = {
  x: 0,
  y: 0,
};
