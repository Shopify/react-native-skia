import React from "react";

import type { ParagraphProps } from "../../../dom/types/Paragraph";
import type { SkiaProps } from "../../processors";

export const Paragraph = (props: SkiaProps<ParagraphProps>) => {
  return <skParagraph {...props} />;
};
