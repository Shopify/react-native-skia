/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CTMProps, DrawingNodeProps, PaintProps } from "../../dom/types";
import { NodeType } from "../../dom/types";
import type { Node } from "../nodes";
import { sortNodeChildren } from "../nodes";

import type { Recorder } from "./Recorder";

export const processPaint = ({
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
}: DrawingNodeProps) => {
  const paint: PaintProps = {};
  if (opacity) {
    paint.opacity = opacity;
  }
  if (color) {
    paint.color = color;
  }
  if (strokeWidth) {
    paint.strokeWidth = strokeWidth;
  }
  if (blendMode) {
    paint.blendMode = blendMode;
  }
  if (style) {
    paint.style = style;
  }
  if (strokeJoin) {
    paint.strokeJoin = strokeJoin;
  }
  if (strokeCap) {
    paint.strokeCap = strokeCap;
  }
  if (strokeMiter) {
    paint.strokeMiter = strokeMiter;
  }
  if (antiAlias) {
    paint.antiAlias = antiAlias;
  }
  if (dither) {
    paint.dither = dither;
  }

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
};

const processCTM = ({
  clip,
  invertClip,
  transform,
  origin,
  matrix,
  layer,
}: CTMProps) => {
  const ctm: CTMProps = {};
  if (clip) {
    ctm.clip = clip;
  }
  if (invertClip) {
    ctm.invertClip = invertClip;
  }
  if (transform) {
    ctm.transform = transform;
  }
  if (origin) {
    ctm.origin = origin;
  }
  if (matrix) {
    ctm.matrix = matrix;
  }
  if (layer) {
    ctm.layer = layer;
  }
  if (
    clip !== undefined ||
    invertClip !== undefined ||
    transform !== undefined ||
    origin !== undefined ||
    matrix !== undefined ||
    layer !== undefined
  ) {
    return ctm;
  }
  return null;
};

const pushColorFilters = (recorder: Recorder, colorFilters: Node<any>[]) => {
  colorFilters.forEach((colorFilter) => {
    if (colorFilter.children.length > 0) {
      pushColorFilters(recorder, colorFilter.children);
    }
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    const needsComposition =
      colorFilter.type !== NodeType.LerpColorFilter &&
      colorFilter.children.length > 0;
    if (needsComposition) {
      recorder.composeColorFilters();
    }
  });
};

const visitNode = (recorder: Recorder, node: Node<any>) => {
  const { colorFilters, drawings } = sortNodeChildren(node);
  const paint = processPaint(node.props);
  const shouldPushPaint = paint || colorFilters.length > 0;
  if (shouldPushPaint) {
    recorder.savePaint(paint ?? {});
    pushColorFilters(recorder, colorFilters);
    recorder.materializePaint();
  }
  const ctm = processCTM(node.props);
  if (ctm) {
    recorder.saveCTM(ctm);
  }
  switch (node.type) {
    case NodeType.Image:
      recorder.drawImage(node.props);
      break;
    case NodeType.Circle:
      recorder.drawCircle(node.props);
      break;
  }
  drawings.forEach((drawing) => {
    visitNode(recorder, drawing);
  });
  if (shouldPushPaint) {
    recorder.restorePaint();
  }
  if (ctm) {
    recorder.restoreCTM();
  }
};

export const visit = (recorder: Recorder, root: Node[]) => {
  root.forEach((node) => {
    visitNode(recorder, node);
  });
};
