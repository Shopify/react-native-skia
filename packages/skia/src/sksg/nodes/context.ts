"worklet";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from "react-native-reanimated";

import { NodeType } from "../../dom/types";
import type { DeclarationContext, DrawingNodeProps } from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";
import { mapKeys } from "../../renderer/typeddash";
import type { SkColorFilter, SkImageFilter } from "../../skia/types";

import type { Node } from "./Node";
import {
  drawAtlas,
  drawBox,
  drawBoxShadow,
  drawCircle,
  drawDiffRect,
  drawFill,
  drawGlyphs,
  drawImage,
  drawImageSVG,
  drawLine,
  drawOval,
  drawParagraph,
  drawPatch,
  drawPath,
  drawPicture,
  drawPoints,
  drawRect,
  drawRRect,
  drawText,
  drawTextBlob,
  drawTextPath,
  drawVertices,
} from "./drawings";
import {
  makeBlendColorFilter,
  makeLerpColorFilter,
  makeLinearToSRGBGammaColorFilter,
  makeLumaColorFilter,
  makeMatrixColorFilter,
  makeSRGBToLinearGammaColorFilter,
} from "./colorFilters";

interface ContextProcessingResult {
  shouldRestoreMatrix: boolean;
  shouldRestorePaint: boolean;
}

const composeColorFilters = (
  ctx: DeclarationContext,
  node: Node<any>,
  cf: SkColorFilter
) => {
  const { Skia } = ctx;
  ctx.save();
  node.children.forEach((child) => processDeclarations(ctx, child));
  const cf1 = ctx.colorFilters.popAllAsOne();
  ctx.restore();
  ctx.colorFilters.push(cf1 ? Skia.ColorFilter.MakeCompose(cf, cf1) : cf);
};

function processDeclarations(ctx: DeclarationContext, node: Node<any>) {
  if (!node.isDeclaration) {
    node.children.forEach((child) => processDeclarations(ctx, child));
    return;
  }
  const { type, props } = node;
  switch (type) {
    // Color Filters
    case NodeType.LerpColorFilter: {
      node.children.forEach((child) => processDeclarations(ctx, child));
      const cf = makeLerpColorFilter(ctx, props);
      ctx.colorFilters.push(cf);
      break;
    }
    case NodeType.BlendColorFilter: {
      const cf = makeBlendColorFilter(ctx, props);
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.SRGBToLinearGammaColorFilter: {
      const cf = makeSRGBToLinearGammaColorFilter(ctx);
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.LinearToSRGBGammaColorFilter: {
      const cf = makeLinearToSRGBGammaColorFilter(ctx);
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.MatrixColorFilter: {
      const cf = makeMatrixColorFilter(ctx, props);
      composeColorFilters(ctx, node, cf);
      break;
    }
    case NodeType.LumaColorFilter: {
      const cf = makeLumaColorFilter(ctx);
      composeColorFilters(ctx, node, cf);
      break;
    }
    // Path Effects

    // Paint
    // case NodeType.Paint:
    //   declarePaint(ctx, props);
    //   break;
    default:
      console.log("Unknown declaration node: ", type);
  }
}

const preProcessContext = (
  ctx: DrawingContext,
  props: DrawingNodeProps,
  node: Node<any>
) => {
  const shouldRestoreMatrix = ctx.processMatrixAndClipping(props, props.layer);
  processDeclarations(ctx.declCtx, node);
  const shouldRestorePaint = ctx.processPaint(props);
  return { shouldRestoreMatrix, shouldRestorePaint };
};

const postProcessContext = (
  ctx: DrawingContext,
  { shouldRestoreMatrix, shouldRestorePaint }: ContextProcessingResult
) => {
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
  // We cannot use `in` operator here because `value` could be a HostObject and therefore we cast.
  return (value as Record<string, unknown>)?._isReanimatedSharedValue === true;
};

const materialize = <T extends object>(props: T) => {
  const result: T = Object.assign({}, props);
  mapKeys(result).forEach((key) => {
    const value = result[key];
    if (isSharedValue(value)) {
      result[key] = value.value as any;
    }
  });
  return result;
};

const drawBackdropFilter = (ctx: DrawingContext, node: Node) => {
  const { canvas, Skia } = ctx;
  const child = node.children[0];
  let imageFilter: SkImageFilter | null = null;
  if (child.isDeclaration) {
    ctx.declCtx.save();
    processDeclarations(ctx.declCtx, node);
    const imgf = ctx.declCtx.imageFilters.pop();
    if (imgf) {
      imageFilter = imgf;
    } else {
      const cf = ctx.declCtx.colorFilters.pop();
      if (cf) {
        imageFilter = Skia.ImageFilter.MakeColorFilter(cf, null);
      }
    }
    ctx.declCtx.restore();
  }
  canvas.saveLayer(undefined, null, imageFilter);
  canvas.restore();
};

export function draw(ctx: DrawingContext, node: Node<any>) {
  // Special mixed nodes
  if (node.type === NodeType.BackdropFilter) {
    drawBackdropFilter(ctx, node);
    return;
  }
  if (node.type === NodeType.Layer) {
    let hasLayer = false;
    const [layer, ...children] = node.children;
    if (layer.isDeclaration) {
      const { declCtx } = ctx;
      declCtx.save();
      processDeclarations(ctx.declCtx, node);
      const paint = declCtx.paints.pop();
      declCtx.restore();
      if (paint) {
        hasLayer = true;
        ctx.canvas.saveLayer(paint);
      }
    }
    children.map((child) => {
      if (!child.isDeclaration) {
        draw(ctx, child);
      }
    });
    if (hasLayer) {
      ctx.canvas.restore();
    }
    return;
  }
  const { type, props: rawProps, children } = node;
  // Regular nodes
  const props = materialize(rawProps);
  const result = preProcessContext(ctx, props, node);
  const paints = ctx.getLocalPaints();
  paints.forEach((paint) => {
    const lctx = { paint, Skia: ctx.Skia, canvas: ctx.canvas };
    switch (type) {
      case NodeType.Box:
        drawBox(lctx, props);
        break;
      case NodeType.BoxShadow:
        drawBoxShadow(lctx, props);
        break;
      case NodeType.Image:
        drawImage(lctx, props);
        break;
      case NodeType.Points:
        drawPoints(lctx, props);
        break;
      case NodeType.Path:
        drawPath(lctx, props);
        break;
      case NodeType.Rect:
        drawRect(lctx, props);
        break;
      case NodeType.RRect:
        drawRRect(lctx, props);
        break;
      case NodeType.Oval:
        drawOval(lctx, props);
        break;
      case NodeType.Line:
        drawLine(lctx, props);
        break;
      case NodeType.Patch:
        drawPatch(lctx, props);
        break;
      case NodeType.Vertices:
        drawVertices(lctx, props);
        break;
      case NodeType.DiffRect:
        drawDiffRect(lctx, props);
        break;
      case NodeType.Text:
        drawText(lctx, props);
        break;
      case NodeType.TextPath:
        drawTextPath(lctx, props);
        break;
      case NodeType.TextBlob:
        drawTextBlob(lctx, props);
        break;
      case NodeType.Glyphs:
        drawGlyphs(lctx, props);
        break;
      case NodeType.Picture:
        drawPicture(lctx, props);
        break;
      case NodeType.ImageSVG:
        drawImageSVG(lctx, props);
        break;
      case NodeType.Paragraph:
        drawParagraph(lctx, props);
        break;
      case NodeType.Atlas:
        drawAtlas(lctx, props);
        break;
      case NodeType.Circle:
        drawCircle(lctx, props);
        break;
      case NodeType.Fill:
        drawFill(lctx, props);
        break;
      case NodeType.Group:
        // TODO: do nothing
        break;
      default:
        if (!node.isDeclaration) {
          console.warn(`Unsupported node type: ${type}`);
        }
    }
  });
  children.forEach((child) => {
    if (!child.isDeclaration) {
      draw(ctx, child);
    }
  });
  postProcessContext(ctx, result);
}
