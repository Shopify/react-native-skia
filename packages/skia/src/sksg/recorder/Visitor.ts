/* eslint-disable @typescript-eslint/no-explicit-any */
"worklet";

import type { DrawingNodeProps } from "../../dom/types";
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";

import type { PaintProps } from "./Paint";
import type { Recorder } from "./Recorder";

function processPaint({
  opacity,
  color,
  strokeWidth,
  blendMode,
  style,
  strokeJoin,
  strokeCap,
  strokeMiter,
  antiAlias,
  dither,
  paint: paintProp,
}: DrawingNodeProps) {
  let shouldRestore = false;
  const paint: PaintProps = {};
  if (
    opacity !== undefined ||
    color !== undefined ||
    strokeWidth !== undefined ||
    blendMode !== undefined ||
    style !== undefined ||
    strokeJoin !== undefined ||
    strokeCap !== undefined ||
    strokeMiter !== undefined ||
    antiAlias !== undefined ||
    dither !== undefined
  ) {
    shouldRestore = true;
  }

  if (opacity !== undefined) {
    paint.opacity = opacity;
  }
  if (color !== undefined) {
    paint.color = color;
  }
  //   if (strokeWidth !== undefined) {
  //     paint.setStrokeWidth(strokeWidth);
  //   }
  //   if (blendMode !== undefined) {
  //     paint.setBlendMode(BlendMode[enumKey(blendMode)]);
  //   }
  //   if (style !== undefined) {
  //     paint.setStyle(PaintStyle[enumKey(style)]);
  //   }
  //   if (strokeJoin !== undefined) {
  //     paint.setStrokeJoin(StrokeJoin[enumKey(strokeJoin)]);
  //   }
  //   if (strokeCap !== undefined) {
  //     paint.setStrokeCap(StrokeCap[enumKey(strokeCap)]);
  //   }
  //   if (strokeMiter !== undefined) {
  //     paint.setStrokeMiter(strokeMiter);
  //   }
  //   if (antiAlias !== undefined) {
  //     paint.setAntiAlias(antiAlias);
  //   }
  //   if (dither !== undefined) {
  //     paint.setDither(dither);
  //   }
  if (shouldRestore) {
    return paint;
  }
  return null;
}

export function record(recorder: Recorder, root: Node<any>) {
  const { type, props, children } = root;
  const paint = processPaint(props as DrawingNodeProps);
  if (paint) {
    recorder.pushPaint(paint);
  }
  switch (type) {
    case NodeType.Fill:
      recorder.drawPaint();
      break;
    case NodeType.Glyphs:
      recorder.drawGlyphs(props);
      break;
  }
  children.forEach((child) => {
    record(recorder, child);
  });
  if (paint) {
    recorder.popPaint();
  }
}
