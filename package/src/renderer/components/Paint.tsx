import type { ReactNode } from "react";
import React, { useRef, useMemo, forwardRef, useImperativeHandle } from "react";

import type { SkPaint } from "../../skia/types";
import type { CustomPaintProps, AnimatedProps } from "../processors";
import { processPaint } from "../processors";
import { createDeclaration } from "../nodes";
import { useCanvas } from "../useCanvas";
import { defaultSkiaPaint } from "../../skia/types";

export const usePaintRef = () => useRef<SkPaint>(null);

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<SkPaint, AnimatedProps<PaintProps>>(
  (props, ref) => {
    const { Skia } = useCanvas();
    const paint = useMemo(() => defaultSkiaPaint(Skia.Paint()), [Skia]);
    useImperativeHandle(ref, () => paint, [paint]);
    const onDeclare = useMemo(
      () =>
        createDeclaration<PaintProps>((paintProps, children, ctx) =>
          processPaint(ctx.Skia, paint, ctx.opacity, paintProps, children)
        ),
      [paint]
    );
    return <skDeclaration onDeclare={onDeclare} {...props} />;
  }
);
