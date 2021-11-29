import type { ReactNode } from "react";
import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";

import type { IPaint } from "../../skia";
import { isShader } from "../../skia/Shader/Shader";
import { isMaskFilter } from "../../skia/MaskFilter";
import { isColorFilter } from "../../skia/ColorFilter/ColorFilter";
import { Skia } from "../../skia/Skia";
import { isImageFilter } from "../../skia/ImageFilter/ImageFilter";
import type { CustomPaintProps } from "../processors";
import { processPaint } from "../processors";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { useDeclaration } from "../nodes/Declaration";

export const usePaintRef = () => useRef<IPaint>(null);

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<IPaint, AnimatedProps<PaintProps>>(
  (props, ref) => {
    const paint = useMemo(() => Skia.Paint(), []);
    useImperativeHandle(ref, () => paint, [paint]);
    const declaration = useDeclaration(props, (paintProps, children, ctx) => {
      processPaint(paint, ctx.opacity, paintProps);
      children.forEach((child) => {
        if (isShader(child)) {
          paint.setShader(child);
        } else if (isMaskFilter(child)) {
          paint.setMaskFilter(child);
        } else if (isColorFilter(child)) {
          paint.setColorFilter(child);
        } else if (isImageFilter(child)) {
          paint.setImageFilter(child);
        }
      });
      return paint;
    });
    return <skDeclaration declaration={declaration} {...props} />;
  }
);
