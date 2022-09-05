import React, { useRef, forwardRef } from "react";

import type { SkPaint } from "../../skia/types";
import type { SkiaProps } from "../processors";
import type { PaintProps } from "../../dom/types";

export const usePaintRef = () => useRef<SkPaint>(null);

export const Paint = forwardRef<SkPaint, SkiaProps<PaintProps>>((props) => {
  // TODO: add ref
  return <skPaint {...props} />;
});
