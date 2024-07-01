/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GroupProps } from "../dom/types";
import { NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";
import { exhaustiveCheck } from "../renderer/typeddash";
import { processTransform3d } from "../skia/types";

import { type DrawingContext } from "./Context";
import {
  renderAtlas,
  renderCircle,
  renderDiffRect,
  renderFill,
  renderImage,
  renderImageSVG,
  renderLayer,
  renderLine,
  renderOval,
  renderPaint,
  renderPatch,
  renderPath,
  renderPicture,
  renderPoints,
  renderRRect,
  renderRect,
  renderVertices,
} from "./Drawing";
import type { PropMap, SGNode } from "./Node";
import {
  renderGlyphs,
  renderParagraph,
  renderText,
  renderTextBlob,
  renderTextPath,
} from "./Text";
import { renderBlurMaskFilter } from "./MaskFilters";
import {
  renderBlendImageFilter,
  renderBlurImageFilter,
  renderDisplacementMapImageFilter,
  renderDropShadowImageFilter,
  renderLumaColorFilter,
  renderMorphologyImageFilter,
  renderOffsetImageFilter,
  renderRuntimeShaderImageFilter,
} from "./ImageFilters";
import {
  renderBlendColorFilter,
  renderLerpColorFilter,
  renderLinearToSRGBGammaColorFilter,
  renderMatrixColorFilter,
  renderSRGBToLinearGammaColorFilter,
} from "./ColorFilters";
import {
  renderColorShader,
  renderFractalNoise,
  renderImageShader,
  renderLinearGradient,
  renderRadialGradient,
  renderShader,
  renderSweepGradient,
  renderTurbulence,
  renderTwoPointConicalGradient,
} from "./Shaders";
import {
  renderCornerPathEffect,
  renderDashPathEffect,
  renderDiscretePathEffect,
  renderLine2DPathEffect,
  renderPath1DPathEffect,
  renderPath2DPathEffect,
  renderSumPathEffect,
} from "./PathEffects";
import {
  renderBackdropFilter,
  renderBlend,
  renderBox,
  renderBoxShadow,
} from "./Mixed";

const isSharedValueKind = (value: unknown): value is { value: unknown } => {
  "worklet";
  return typeof value === "object" && value !== null && "value" in value;
};

const materialize = <P>(props: AnimatedProps<P>) => {
  "worklet";
  const materializedProps: Record<string, unknown> = {};
  for (const key in props) {
    const value = props[key];
    if (isSharedValueKind(value)) {
      materializedProps[key] = value.value;
    } else {
      materializedProps[key] = value;
    }
  }
  return materializedProps as any;
};

const processContext = (ctx: DrawingContext, props: GroupProps) => {
  "worklet";
  let restore = false;
  if (props.matrix) {
    ctx.canvas.save();
    ctx.canvas.concat(props.matrix);
    restore = true;
  } else if (props.transform) {
    ctx.canvas.save();
    ctx.canvas.concat(processTransform3d(props.transform));
    restore = true;
  }

  return { restore };
};

export const renderNode = (ctx: DrawingContext, node: SGNode) => {
  "worklet";
  const materializedProps = materialize(node.props) as unknown;
  let restore = false;
  switch (node.type) {
    case NodeType.Group:
      const result = processContext(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      // eslint-disable-next-line prefer-destructuring
      restore = result.restore;
      node.children?.forEach((child) => renderNode(ctx, child));
      break;
    case NodeType.Layer:
      renderLayer(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Paint:
      renderPaint(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Fill:
      renderFill(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Image:
      renderImage(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Circle:
      renderCircle(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Path:
      renderPath(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Line:
      renderLine(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Oval:
      renderOval(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Patch:
      renderPatch(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Points:
      renderPoints(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Rect:
      renderRect(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.RRect:
      renderRRect(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Atlas:
      renderAtlas(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Vertices:
      renderVertices(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Text:
      renderText(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.TextPath:
      renderTextPath(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.TextBlob:
      renderTextBlob(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Glyphs:
      renderGlyphs(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.DiffRect:
      renderDiffRect(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Picture:
      renderPicture(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.ImageSVG:
      renderImageSVG(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.BlurMaskFilter:
      renderBlurMaskFilter(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.BlendImageFilter:
      renderBlendImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.BlurImageFilter:
      renderBlurImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.OffsetImageFilter:
      renderOffsetImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.DropShadowImageFilter:
      renderDropShadowImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.DisplacementMapImageFilter:
      renderDisplacementMapImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.RuntimeShaderImageFilter:
      renderRuntimeShaderImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.MorphologyImageFilter:
      renderMorphologyImageFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.MatrixColorFilter:
      renderMatrixColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.BlendColorFilter:
      renderBlendColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.LinearToSRGBGammaColorFilter:
      renderLinearToSRGBGammaColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.SRGBToLinearGammaColorFilter:
      renderSRGBToLinearGammaColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.LumaColorFilter:
      renderLumaColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.LerpColorFilter:
      renderLerpColorFilter(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.Shader:
      renderShader(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.ImageShader:
      renderImageShader(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.ColorShader:
      renderColorShader(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Turbulence:
      renderTurbulence(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.FractalNoise:
      renderFractalNoise(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.LinearGradient:
      renderLinearGradient(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.RadialGradient:
      renderRadialGradient(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.SweepGradient:
      renderSweepGradient(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.TwoPointConicalGradient:
      renderTwoPointConicalGradient(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.DiscretePathEffect:
      renderDiscretePathEffect(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.DashPathEffect:
      renderDashPathEffect(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Path1DPathEffect:
      renderPath1DPathEffect(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.Path2DPathEffect:
      renderPath2DPathEffect(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.CornerPathEffect:
      renderCornerPathEffect(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.SumPathEffect:
      renderSumPathEffect(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Line2DPathEffect:
      renderLine2DPathEffect(
        ctx,
        materializedProps as PropMap[typeof node.type]
      );
      break;
    case NodeType.Blend:
      renderBlend(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.BackdropFilter:
      renderBackdropFilter(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Box:
      renderBox(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.BoxShadow:
      renderBoxShadow(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    case NodeType.Paragraph:
      renderParagraph(ctx, materializedProps as PropMap[typeof node.type]);
      break;
    default:
      return exhaustiveCheck(node.type);
  }
  if (restore) {
    ctx.canvas.restore();
  }
  // if (restorePaint) {
  //   //ctx.paint.restore();
  // }
};
