/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from "react-native-reanimated";

import {
  NodeType,
  type PaintProps,
  type TransformProps,
} from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";
import { mapKeys } from "../../renderer/typeddash";

import { declareBlurMaskFilter } from "./imageFilters";
import type { Node } from "./Node";
import {
  drawAtlas,
  drawCircle,
  drawFill,
  drawImageSVG,
  drawParagraph,
  drawPicture,
} from "./drawings";

interface ContextProcessingResult {
  shouldRestoreMatrix: boolean;
  shouldRestorePaint: boolean;
}

const preProcessContext = (
  ctx: DrawingContext,
  props: PaintProps & TransformProps,
  children: Node<any>[]
) => {
  "worklet";
  const shouldRestoreMatrix = ctx.processMatrix(props);
  ctx.declCtx.save();
  children.forEach((node) => {
    switch (node.type) {
      case NodeType.BlurMaskFilter:
        declareBlurMaskFilter(ctx, node);
        break;
    }
  });
  ctx.declCtx.restore();
  const shouldRestorePaint = ctx.processPaint(props);
  return { shouldRestoreMatrix, shouldRestorePaint };
};

const postProcessContext = (
  ctx: DrawingContext,
  { shouldRestoreMatrix, shouldRestorePaint }: ContextProcessingResult
) => {
  "worklet";
  if (shouldRestoreMatrix) {
    ctx.canvas.restore();
  }
  if (shouldRestorePaint) {
    ctx.restore();
  }
};

export const isSharedValue = <T = unknown>(
  value: unknown
): value is SharedValue<T> => {
  "worklet";
  // We cannot use `in` operator here because `value` could be a HostObject and therefore we cast.
  return (value as Record<string, unknown>)?._isReanimatedSharedValue === true;
};

const materialize = <T extends object>(props: T) => {
  "worklet";
  const result: T = Object.assign({}, props);
  mapKeys(result).forEach((key) => {
    const value = result[key];
    if (isSharedValue(value)) {
      result[key] = value.value as any;
    }
  });
  return result;
};

export function draw(ctx: DrawingContext, node: Node<any>) {
  "worklet";
  const { type, props: rawProps, children } = node;
  const props = materialize(rawProps);
  const result = preProcessContext(ctx, props, children);
  switch (type) {
    case NodeType.Layer:
    case NodeType.Box:
    case NodeType.BoxShadow:
    case NodeType.Paint:
    case NodeType.Image:
    case NodeType.Points:
    case NodeType.Path:
    case NodeType.Rect:
    case NodeType.RRect:
    case NodeType.Oval:
    case NodeType.Line:
    case NodeType.Patch:
    case NodeType.Vertices:
    case NodeType.DiffRect:
    case NodeType.Text:
    case NodeType.TextPath:
    case NodeType.TextBlob:
    case NodeType.Glyphs:
    case NodeType.Picture:
      drawPicture(ctx, props);
      break;
    case NodeType.ImageSVG:
      drawImageSVG(ctx, props);
      break;
    case NodeType.Paragraph:
      drawParagraph(ctx, props);
      break;
    case NodeType.Atlas:
      drawAtlas(ctx, props);
      break;
    case NodeType.Circle:
      drawCircle(ctx, props);
      break;
    case NodeType.Fill:
      drawFill(ctx, props);
      break;
    case NodeType.Group:
      // TODO: do nothing
      break;
  }
  children.forEach((child) => {
    if (!child.isDeclaration) {
      draw(ctx, child);
    }
  });
  postProcessContext(ctx, result);
}
