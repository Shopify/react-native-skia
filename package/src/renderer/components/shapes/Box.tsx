import React from "react";

import type { Color, SkRRect } from "../../../skia";
import { ClipOp, BlurStyle, Skia, processColor } from "../../../skia";
import { createDrawing } from "../../nodes";
import type { AnimatedProps, CustomPaintProps } from "../../processors";
import { add, vec, rrect } from "../../processors";
import { rect, isRRect } from "../../processors/Rects";
import { createDeclaration } from "../../nodes/Declaration";
import type { SkJSIInstance } from "../../../skia/JsiInstance";
import type { SkRect } from "../../../skia/Rect";

const inflate = (box: SkRRect, dx: number, dy: number, tx = 0, ty = 0) =>
  rrect(
    rect(
      box.rect.x - dx + tx,
      box.rect.y - dy + ty,
      box.rect.width + 2 * dx,
      box.rect.height + 2 * dy
    ),
    box.rx + dx,
    box.ry + dy
  );

const deflate = (box: SkRRect, dx: number, dy: number, tx = 0, ty = 0) =>
  inflate(box, -dx, -dy, tx, ty);

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
  const box = isRRect(defaultBox) ? defaultBox : rrect(defaultBox, 0, 0);
  const { canvas, paint, opacity } = ctx;
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
      canvas.drawRRect(inflate(box, spread, spread, dx, dy), lPaint);
    });
  canvas.drawRRect(box, paint);

  shadows
    .filter((shadow) => shadow.inner)
    .map((shadow) => {
      const { color = "black", blur, spread = 0, dx = 0, dy = 0 } = shadow;
      const delta = add(vec(10, 10), vec(Math.abs(dx), Math.abs(dy)));
      canvas.save();
      canvas.clipRRect(box, ClipOp.Intersect, false);
      const lPaint = Skia.Paint();
      lPaint.setColor(processColor(color, opacity));
      lPaint.setMaskFilter(
        Skia.MaskFilter.MakeBlur(BlurStyle.Normal, blur, true)
      );
      const inner = deflate(box, spread, spread, dx, dy);
      const outer = inflate(box, delta.x, delta.y);
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
