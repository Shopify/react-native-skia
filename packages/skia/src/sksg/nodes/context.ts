"worklet";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SharedValue } from "react-native-reanimated";

import { NodeType } from "../../dom/types";
import type { DrawingNodeProps } from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";
import { mapKeys } from "../../renderer/typeddash";
import type { SkImageFilter } from "../../skia/types";

import {
  declareBlurImageFilter,
  declareBlurMaskFilter,
  declareDropShadowImageFilter,
  declareMorphologyImageFilter,
  declareOffsetImageFilter,
  declareDisplacementMapImageFilter,
  declareBlendImageFilter,
  declareBlend,
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
  declareColorShader,
  declareFractalNoiseShader,
  declareImageShader,
  declareLinearGradientShader,
  declareRadialGradientShader,
  declareShader,
  declareSweepGradientShader,
  declareTurbulenceShader,
  declareTwoPointConicalGradientShader,
} from "./shaders";
import {
  declareBlendColorFilter,
  declareLerpColorFilter,
  declareLinearToSRGBGammaColorFilter,
  declareLumaColorFilter,
  declareMatrixColorFilter,
  declarePaint,
  declareSRGBToLinearGammaColorFilter,
} from "./colorFilters";
import {
  declareCornerPathEffect,
  declareDashPathEffect,
  declareDiscretePathEffect,
  declareLine2DPathEffect,
  declarePath1DPathEffect,
  declarePath2DPathEffect,
  declareSumPathEffect,
} from "./pathEffects";

interface ContextProcessingResult {
  shouldRestoreMatrix: boolean;
  shouldRestorePaint: boolean;
}

function processDeclaration(ctx: DrawingContext, root: Node<unknown>) {
  if (root.children.length === 0) {
    return;
  }
  root.children.forEach((node: Node<any>) => {
    if (!node.isDeclaration) {
      return;
    }
    processDeclaration(ctx, node);
    const { type, props } = node;
    switch (type) {
      case NodeType.Blend:
        declareBlend(ctx, props);
        break;
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
      case NodeType.LinearGradient:
        declareLinearGradientShader(ctx, props);
        break;
      case NodeType.SweepGradient:
        declareSweepGradientShader(ctx, props);
        break;
      case NodeType.RadialGradient:
        declareRadialGradientShader(ctx, props);
        break;
      case NodeType.TwoPointConicalGradient:
        declareTwoPointConicalGradientShader(ctx, props);
        break;
      case NodeType.FractalNoise:
        declareFractalNoiseShader(ctx, props);
        break;
      case NodeType.ColorShader:
        declareColorShader(ctx, props);
        break;
      // Image Filters
      case NodeType.BlendImageFilter:
        declareBlendImageFilter(ctx, props);
        break;
      case NodeType.BlurImageFilter:
        declareBlurImageFilter(ctx, props);
        break;
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
      case NodeType.LumaColorFilter:
        declareLumaColorFilter(ctx);
        break;
      // Path Effects
      case NodeType.CornerPathEffect:
        declareCornerPathEffect(ctx, props);
        break;
      case NodeType.DiscretePathEffect:
        declareDiscretePathEffect(ctx, props);
        break;
      case NodeType.Path2DPathEffect:
        declarePath2DPathEffect(ctx, props);
        break;
      case NodeType.DashPathEffect:
        declareDashPathEffect(ctx, props);
        break;
      case NodeType.SumPathEffect:
        declareSumPathEffect(ctx);
        break;
      case NodeType.Line2DPathEffect:
        declareLine2DPathEffect(ctx, props);
        break;
      case NodeType.Path1DPathEffect:
        declarePath1DPathEffect(ctx, props);
        break;
      // Paint
      case NodeType.Paint:
        declarePaint(ctx, props);
        break;
      default:
        console.log("Unknown declaration node: ", type);
    }
  });
}

const preProcessContext = (
  ctx: DrawingContext,
  props: DrawingNodeProps,
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

const drawBackdropFilter = (ctx: DrawingContext, node: Node) => {
  const { canvas, Skia } = ctx;
  const child = node.children[0];
  let imageFilter: SkImageFilter | null = null;
  if (child.isDeclaration) {
    ctx.declCtx.save();
    processDeclaration(ctx, node);
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

const drawLayer = (ctx: DrawingContext, node: Node) => {
  let hasLayer = false;
  const [layer, ...children] = node.children;
  if (layer.isDeclaration) {
    const { declCtx } = ctx;
    declCtx.save();
    processDeclaration(ctx, node);
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
};

export function draw(ctx: DrawingContext, node: Node<any>) {
  const { type, props: rawProps, children } = node;
  // Special mixed nodes
  if (type === NodeType.BackdropFilter) {
    drawBackdropFilter(ctx, node);
    return;
  }
  if (type === NodeType.Layer) {
    drawLayer(ctx, node);
    return;
  }
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
