import React from "react";
import { ParagraphProps } from "../../../dom/types/Paragraph";
import type { SkiaProps } from "../../processors";

export const Paragraph = (props: SkiaProps<ParagraphProps>) => {
  return <skParagraph {...props} />;
};
