/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from "react-native-reanimated";

import { enumKey } from "../dom/nodes";
import type {
  BlurMaskFilterProps,
  PaintProps,
  TransformProps,
} from "../dom/types";
import { NodeType } from "../dom/types";
import { mapKeys } from "../renderer/typeddash";

import type { DrawingContext } from "./DrawingContext";
import type { Node } from "./Node";
import { declareBlurMaskFilter } from "./nodes/imageFilters";
import { drawCircle, drawFill } from "./nodes/drawings";

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
    case NodeType.Circle:
      drawCircle(ctx, props);
      break;
    case NodeType.Fill:
      drawFill(ctx, props);
      break;
    case NodeType.Group:
      // TODO: do nothing
      break;
    // TODO: exhaustive check?
  }
  children.forEach((child) => {
    if (!child.isDeclaration) {
      draw(ctx, child);
    }
  });
  postProcessContext(ctx, result);
}
