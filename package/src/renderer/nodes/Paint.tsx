import type { ReactNode } from "react";
import { useMemo, forwardRef, useImperativeHandle } from "react";

import type { IPaint } from "../../skia";
import { isShader } from "../../skia/Shader/Shader";
import { isMaskFilter } from "../../skia/MaskFilter";
import { isColorFilter } from "../../skia/ColorFilter/ColorFilter";
import { Skia } from "../../skia/Skia";

import type { CustomPaintProps } from "./processors";
import { processPaint } from "./processors";
import { useDeclaration } from "./Declaration";

export interface PaintProps extends Omit<CustomPaintProps, "paint"> {
  children?: ReactNode | ReactNode[];
}

export const Paint = forwardRef<IPaint, PaintProps>((props, ref) => {
  const paint = useMemo(() => Skia.Paint(), []);
  useImperativeHandle(ref, () => paint, [paint]);
  const onDeclare = useDeclaration(
    (ctx, children) => {
      processPaint(paint, ctx.opacity, props);
      children.forEach((child) => {
        if (isShader(child)) {
          paint.setShader(child);
        } else if (isMaskFilter(child)) {
          paint.setMaskFilter(child);
        } else if (isColorFilter(child)) {
          paint.setColorFilter(child);
        }
      });
      return paint;
    },
    [props, paint]
  );
  return <skDeclaration onDeclare={onDeclare} {...props} />;
});
