"worklet";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import type { DeclarationContext, DrawingNodeProps } from "../../dom/types";
import type { DrawingContext } from "../DrawingContext";
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
  declareLerpColorFilter,
  makeBlendColorFilter,
  makeLinearToSRGBGammaColorFilter,
  makeLumaColorFilter,
  makeMatrixColorFilter,
  makeSRGBToLinearGammaColorFilter,
} from "./colorFilters";
import {
  declareBlendImageFilter,
  declareBlurMaskFilter,
  declareDisplacementMapImageFilter,
  makeBlurImageFilter,
  makeDropShadowImageFilter,
  makeMorphologyImageFilter,
  makeOffsetImageFilter,
  makeRuntimeShaderImageFilter,
} from "./imageFilters";
import { materialize } from "./utils";

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

const composeImageFilters = (
  ctx: DeclarationContext,
  node: Node<any>,
  imgf1: SkImageFilter
) => {
  const { Skia } = ctx;
  ctx.save();
  node.children.forEach((child) => processDeclarations(ctx, child));
  let imgf2 = ctx.imageFilters.popAllAsOne();
  const cf = ctx.colorFilters.popAllAsOne();
  ctx.restore();
  if (cf) {
    imgf2 = Skia.ImageFilter.MakeCompose(
      imgf2 ?? null,
      Skia.ImageFilter.MakeColorFilter(cf, null)
    );
  }
  const imgf = imgf2 ? Skia.ImageFilter.MakeCompose(imgf1, imgf2) : imgf1;
  ctx.imageFilters.push(imgf);
};

function processDeclarations(ctx: DeclarationContext, node: Node<any>) {
  const { type } = node;
  const props = materialize(node.props);
  switch (type) {
    // Mask Filter
    case NodeType.BlurMaskFilter: {
      declareBlurMaskFilter(ctx, props);
      break;
    }
    // Color Filters
    case NodeType.LerpColorFilter: {
      node.children.forEach((child) => processDeclarations(ctx, child));
      declareLerpColorFilter(ctx, props);
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
    // Image Filters
    case NodeType.BlurImageFilter: {
      const imgf = makeBlurImageFilter(ctx, props);
      composeImageFilters(ctx, node, imgf);
      break;
    }
    case NodeType.OffsetImageFilter: {
      const imgf = makeOffsetImageFilter(ctx, props);
      composeImageFilters(ctx, node, imgf);
      break;
    }
    case NodeType.DisplacementMapImageFilter: {
      node.children.forEach((child) => processDeclarations(ctx, child));
      declareDisplacementMapImageFilter(ctx, props);
      break;
    }
    case NodeType.DropShadowImageFilter: {
      const imgf = makeDropShadowImageFilter(ctx, props);
      composeImageFilters(ctx, node, imgf);
      break;
    }
    case NodeType.MorphologyImageFilter: {
      const imgf = makeMorphologyImageFilter(ctx, props);
      composeImageFilters(ctx, node, imgf);
      break;
    }
    case NodeType.BlendImageFilter: {
      node.children.forEach((child) => processDeclarations(ctx, child));
      declareBlendImageFilter(ctx, props);
      break;
    }
    case NodeType.RuntimeShaderImageFilter: {
      const imgf = makeRuntimeShaderImageFilter(ctx, props);
      composeImageFilters(ctx, node, imgf);
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
  ctx.declCtx.save();
  node.children.forEach((child) => {
    if (child.isDeclaration) {
      processDeclarations(ctx.declCtx, child);
    }
  });
  const shouldRestorePaint = ctx.processPaint(props);
  ctx.declCtx.restore();
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
