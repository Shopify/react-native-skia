"worklet";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from "react-native-reanimated";

import { NodeType } from "../../dom/types";
import type { GroupProps } from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";
import { mapKeys } from "../../renderer/typeddash";

import {
  declareBlurImageFilter,
  declareBlurMaskFilter,
  declareDropShadowImageFilter,
  declareMorphologyImageFilter,
  declareOffsetImageFilter,
  declareDisplacementMapImageFilter,
} from "./imageFilters";
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
  drawLayer,
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
  declareImageShader,
  declareShader,
  declareTurbulenceShader,
} from "./shaders";
import {
  declareBlendColorFilter,
  declareLerpColorFilter,
  declareLinearToSRGBGammaColorFilter,
  declareMatrixColorFilter,
  declarePaint,
  declareSRGBToLinearGammaColorFilter,
} from "./colorFilters";

interface ContextProcessingResult {
  shouldRestoreMatrix: boolean;
  shouldRestorePaint: boolean;
}

function processDeclaration(ctx: DrawingContext, root: Node<unknown>) {
  if (root.children.length === 0) {
    return;
  }
  root.children.forEach((node: Node<any>) => {
    ctx.declCtx.save();

    processDeclaration(ctx, node);
    const { type, props } = node;
    switch (type) {
      // Shaders
      case NodeType.Shader:
        declareShader(ctx, props);
        break;
      case NodeType.ImageShader:
        declareImageShader(ctx, props);
        break;
      case NodeType.Turbulence:
        declareTurbulenceShader(ctx, props);
        break;
      // Image Filters
      case NodeType.BlurMaskFilter:
        declareBlurMaskFilter(ctx, props);
        break;
      case NodeType.MorphologyImageFilter:
        declareMorphologyImageFilter(ctx, props);
        break;
      case NodeType.OffsetImageFilter:
        declareOffsetImageFilter(ctx, props);
        break;
      case NodeType.DropShadowImageFilter:
        declareDropShadowImageFilter(ctx, props);
        break;
      case NodeType.DisplacementMapImageFilter:
        declareDisplacementMapImageFilter(ctx, props);
        break;
      // Color Filters
      case NodeType.BlendColorFilter:
        declareBlendColorFilter(ctx, props);
        break;
      case NodeType.SRGBToLinearGammaColorFilter:
        declareSRGBToLinearGammaColorFilter(ctx);
        break;
      case NodeType.LinearToSRGBGammaColorFilter:
        declareLinearToSRGBGammaColorFilter(ctx);
        break;
      case NodeType.MatrixColorFilter:
        declareMatrixColorFilter(ctx, props);
        break;
      case NodeType.LerpColorFilter:
        declareLerpColorFilter(ctx, props);
        break;
      // Paint
      case NodeType.Paint:
        declarePaint(ctx, props);
        break;
      case NodeType.BlurImageFilter:
        declareBlurImageFilter(ctx, props);
        break;
      default:
        if (node.isDeclaration) {
          console.log("Unknown declaration node: ", type);
        }
    }
    ctx.declCtx.restore();
  });
}

const preProcessContext = (
  ctx: DrawingContext,
  props: GroupProps,
  node: Node<any>
) => {
  const shouldRestoreMatrix = ctx.processMatrixAndClipping(props, props.layer);
  processDeclaration(ctx, node);
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

export function draw(ctx: DrawingContext, node: Node<any>) {
  const { type, props: rawProps, children } = node;
  const props = materialize(rawProps);
  const result = preProcessContext(ctx, props, node);
  switch (type) {
    case NodeType.Layer:
      drawLayer(ctx, props);
      break;
    case NodeType.Box:
      drawBox(ctx, props);
      break;
    case NodeType.BoxShadow:
      drawBoxShadow(ctx, props);
      break;
    case NodeType.Image:
      drawImage(ctx, props);
      break;
    case NodeType.Points:
      drawPoints(ctx, props);
      break;
    case NodeType.Path:
      drawPath(ctx, props);
      break;
    case NodeType.Rect:
      drawRect(ctx, props);
      break;
    case NodeType.RRect:
      drawRRect(ctx, props);
      break;
    case NodeType.Oval:
      drawOval(ctx, props);
      break;
    case NodeType.Line:
      drawLine(ctx, props);
      break;
    case NodeType.Patch:
      drawPatch(ctx, props);
      break;
    case NodeType.Vertices:
      drawVertices(ctx, props);
      break;
    case NodeType.DiffRect:
      drawDiffRect(ctx, props);
      break;
    case NodeType.Text:
      drawText(ctx, props);
      break;
    case NodeType.TextPath:
      drawTextPath(ctx, props);
      break;
    case NodeType.TextBlob:
      drawTextBlob(ctx, props);
      break;
    case NodeType.Glyphs:
      drawGlyphs(ctx, props);
      break;
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
    default:
      if (!node.isDeclaration) {
        console.warn(`Unsupported node type: ${type}`);
      }
  }
  children.forEach((child) => {
    if (!child.isDeclaration) {
      draw(ctx, child);
    }
  });
  postProcessContext(ctx, result);
}
