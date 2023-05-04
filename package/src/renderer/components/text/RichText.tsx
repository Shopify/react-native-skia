import React from "react";

import type {
  ChildrenProps,
  SpanProps,
  RichTextProps,
} from "../../../dom/types";
import type { SkiaProps } from "../../processors";

export const RichText = (props: SkiaProps<RichTextProps>) => {
  return <skRichText {...props} />;
};

export const Span = (props: SkiaProps<SpanProps> & ChildrenProps) => {
  return <skSpan {...props} />;
};
