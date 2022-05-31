import React from "react";

import type { Color, SkRRect, SkJSIInstance, SkRect } from "../../../skia";
import { ClipOp, BlurStyle, processColor } from "../../../skia";
import { createDrawing } from "../../nodes";
import type { AnimatedProps, CustomPaintProps } from "../../processors";
import { isRRect } from "../../processors/Rects";
import { createDeclaration } from "../../nodes/Declaration";
import type { Skia } from "../../../skia/types";

const inflate = (
  Skia: Skia,
  box: SkRRect,
  dx: number,
  dy: number,
  tx = 0,
  ty = 0
) =>
  Skia.RRectXY(
    Skia.XYWHRect(
      box.rect.x - dx + tx,
      box.rect.y - dy + ty,
      box.rect.width + 2 * dx,
      box.rect.height + 2 * dy
    ),
    box.rx + dx,
    box.ry + dy
  );

const deflate = (
  Skia: Skia,
  box: SkRRect,
  dx: number,
  dy: number,
  tx = 0,
  ty = 0
) => inflate(Skia, box, -dx, -dy, tx, ty);

interface BoxShadowProps {
  dx?: number;
  dy?: number;
  spread?: number;
  blur: number;
  color?: Color;
  inner?: boolean;
}

interface BoxShadowDecl extends BoxShadowProps, SkJSIInstance<"BoxShadow"> {}

const onDeclare = createDeclaration<BoxShadowProps>(
  ({ dx, dy, spread, blur, color, inner }) => {
    return { dx, dy, spread, blur, color, inner, __typename__: "BoxShadow" };
  }
);

export const BoxShadow = (props: AnimatedProps<BoxShadowProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

const isBoxShadow = (s: SkJSIInstance<string>): s is BoxShadowDecl =>
  s.__typename__ === "BoxShadow";

interface BoxProps extends CustomPaintProps {
  box: SkRRect | SkRect;
}

const onDraw = createDrawing<BoxProps>((ctx, { box: defaultBox }, node) => {
  const { canvas, paint, opacity, Skia } = ctx;
  const box = isRRect(defaultBox) ? defaultBox : Skia.RRectXY(defaultBox, 0, 0);
  const shadows = node.visit(ctx).filter<BoxShadowDecl>(isBoxShadow);
  shadows
    .filter((shadow) => !shadow.inner)
    .map((shadow) => {
      const { color = "black", blur, spread = 0, dx = 0, dy = 0 } = shadow;
      const lPaint = Skia.Paint();
      lPaint.setColor(processColor(color, opacity));
      lPaint.setMaskFilter(
        Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, true)
      );
      canvas.drawRRect(inflate(Skia, box, spread, spread, dx, dy), lPaint);
    });
  canvas.drawRRect(box, paint);

  shadows
    .filter((shadow) => shadow.inner)
    .map((shadow) => {
      const { color = "black", blur, spread = 0, dx = 0, dy = 0 } = shadow;
      const delta = Skia.Point(10 + Math.abs(dx), 10 + Math.abs(dy));
      canvas.save();
      canvas.clipRRect(box, ClipOp.Intersect, false);
      const lPaint = Skia.Paint();
      lPaint.setColor(processColor(color, opacity));
      lPaint.setMaskFilter(
        Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, true)
      );
      const inner = deflate(Skia, box, spread, spread, dx, dy);
      const outer = inflate(Skia, box, delta.x, delta.y);
      canvas.drawDRRect(outer, inner, lPaint);
      canvas.restore();
    });
});

export const Box = (props: AnimatedProps<BoxProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Box.defaultProps = {
  shadows: [],
};
