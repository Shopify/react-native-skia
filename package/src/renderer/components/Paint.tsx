import React, { useRef, forwardRef, useMemo, useImperativeHandle } from "react";

import type { SkPaint } from "../../skia/types";
import type { SkiaProps } from "../processors";
import type { PaintProps } from "../../dom/types";
import { useCanvas } from "../useCanvas";

export const usePaintRef = () => useRef<SkPaint>(null);

export const Paint = forwardRef<SkPaint, SkiaProps<PaintProps>>(
  (props, ref) => {
    const { Skia } = useCanvas();
    const paint = useMemo(() => Skia.Paint(), [Skia]);
    useImperativeHandle(ref, () => paint, [paint]);
    return <skPaint paint={paint} {...props} />;
  }
);
