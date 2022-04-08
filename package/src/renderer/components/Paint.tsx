import type { ReactNode } from "react";
import React, { useRef, useMemo, forwardRef, useImperativeHandle } from "react";

import type { SkPaint, SkImageFilter } from "../../skia";
import {
  isShader,
  isMaskFilter,
  isColorFilter,
  Skia,
  isImageFilter,
  isPathEffect,
} from "../../skia";
import type { CustomPaintProps, AnimatedProps } from "../processors";
import { processPaint } from "../processors";
import { createDeclaration } from "../nodes";

export const usePaintRef = () => useRef<SkPaint>(null);

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<SkPaint, AnimatedProps<PaintProps>>(
  (props, ref) => {
    const paint = useMemo(() => Skia.Paint(), []);
    useImperativeHandle(ref, () => paint, [paint]);
    const onDeclare = useMemo(
      () =>
        createDeclaration<PaintProps>((paintProps, children, ctx) => {
          processPaint(paint, ctx.opacity, paintProps);
          children.forEach((child) => {
            if (isShader(child)) {
              paint.setShader(child);
            } else if (isMaskFilter(child)) {
              paint.setMaskFilter(child);
            } else if (isColorFilter(child)) {
              paint.setColorFilter(child);
            } else if (isPathEffect(child)) {
              paint.setPathEffect(child);
            }
          });
          const filters = children.filter(isImageFilter);
          if (filters.length > 0) {
            paint.setImageFilter(
              filters
                .reverse()
                .reduce<SkImageFilter | null>(
                  Skia.ImageFilter.MakeCompose,
                  null
                )
            );
          }
          return paint;
        }),
      [paint]
    );
    return <skDeclaration onDeclare={onDeclare} {...props} />;
  }
);
