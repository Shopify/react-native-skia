/* eslint-disable @typescript-eslint/no-explicit-any */
"worklet";

import type { CTMProps, DrawingNodeProps } from "../../dom/types";
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
  const paint: PaintProps = {
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
  };

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
    return paint;
  }
  return null;
}

function processCTM({ clip, invertClip, transform, origin, matrix }: CTMProps) {
  const ctm: CTMProps = {
    clip,
    invertClip,
    transform,
    origin,
    matrix,
  };
  if (
    clip !== undefined ||
    invertClip !== undefined ||
    transform !== undefined ||
    origin !== undefined ||
    matrix !== undefined
  ) {
    return ctm;
  }
  return null;
}

export function record(recorder: Recorder, root: Node<any>) {
  const { type, props, children } = root;
  const paint = processPaint(props as DrawingNodeProps);
  const ctm = processCTM(props as DrawingNodeProps);
  if (paint) {
    recorder.pushPaint(paint);
  }
  if (ctm) {
    recorder.pushCTM(ctm);
  }
  switch (type) {
    case NodeType.Fill:
      recorder.drawPaint();
      break;
    case NodeType.Glyphs:
      recorder.drawGlyphs(props);
      break;
    case NodeType.Circle:
      recorder.drawCircle(props);
      break;
  }
  children.forEach((child) => {
    record(recorder, child);
  });
  if (paint) {
    recorder.popPaint();
  }
  if (ctm) {
    recorder.popCTM();
  }
}
