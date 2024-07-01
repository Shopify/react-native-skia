/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";
import Rea from "../external/reanimated/ReanimatedProxy";
import { exhaustiveCheck } from "../renderer/typeddash";

import { processContext, type DrawingContext } from "./Context";
import {
  renderAtlas,
  renderCircle,
  renderDiffRect,
  renderFill,
  renderImageSVG,
  renderLine,
  renderOval,
  renderPatch,
  renderPath,
  renderPicture,
  renderPoints,
  renderRRect,
  renderRect,
  renderVertices,
} from "./Drawing";
import type { SGNode } from "./Node";

const materialize = <P>(props: AnimatedProps<P>) => {
  "worklet";
  const materializedProps: Record<string, unknown> = {};
  for (const key in props) {
    const value = props[key];
    if (Rea.isSharedValue(value)) {
      materializedProps[key] = value.value;
    } else {
      materializedProps[key] = value;
    }
  }
  return materializedProps as any;
};

export const renderNode = (ctx: DrawingContext, node: SGNode) => {
  "worklet";
  const materializedProps = materialize(node.props);
  const { restore, restorePaint } = processContext(ctx, materializedProps);
  //const { invertClip, layer, matrix, transform } = materializedProps;

  switch (node.type) {
    case NodeType.Group:
      renderGroup(ctx, materializedProps);
      break;
    case NodeType.Layer:
      renderLayer(ctx, materializedProps);
      break;
    case NodeType.Paint:
      renderPaint(ctx, materializedProps);
      break;
    case NodeType.Fill:
      renderFill(ctx, materializedProps);
      break;
    case NodeType.Image:
      renderImage(ctx, materializedProps);
      break;
    case NodeType.Circle:
      renderCircle(ctx, materializedProps);
      break;
    case NodeType.Path:
      renderPath(ctx, materializedProps);
      break;
    case NodeType.Line:
      renderLine(ctx, materializedProps);
      break;
    case NodeType.Oval:
      renderOval(ctx, materializedProps);
      break;
    case NodeType.Patch:
      renderPatch(ctx, materializedProps);
      break;
    case NodeType.Points:
      renderPoints(ctx, materializedProps);
      break;
    case NodeType.Rect:
      renderRect(ctx, materializedProps);
      break;
    case NodeType.RRect:
      renderRRect(ctx, materializedProps);
      break;
    case NodeType.Atlas:
      renderAtlas(ctx, materializedProps);
      break;
    case NodeType.Vertices:
      renderVertices(ctx, materializedProps);
      break;
    case NodeType.Text:
      renderText(ctx, materializedProps);
      break;
    case NodeType.TextPath:
      renderTextPath(ctx, materializedProps);
      break;
    case NodeType.TextBlob:
      renderTextBlob(ctx, materializedProps);
      break;
    case NodeType.Glyphs:
      renderGlyphs(ctx, materializedProps);
      break;
    case NodeType.DiffRect:
      renderDiffRect(ctx, materializedProps);
      break;
    case NodeType.Picture:
      renderPicture(ctx, materializedProps);
      break;
    case NodeType.ImageSVG:
      renderImageSVG(ctx, materializedProps);
      break;
    case NodeType.BlurMaskFilter:
      renderBlurMaskFilter(ctx, materializedProps);
      break;
    case NodeType.BlendImageFilter:
      renderBlendImageFilter(ctx, materializedProps);
      break;
    case NodeType.BlurImageFilter:
      renderBlurImageFilter(ctx, materializedProps);
      break;
    case NodeType.OffsetImageFilter:
      renderOffsetImageFilter(ctx, materializedProps);
      break;
    case NodeType.DropShadowImageFilter:
      renderDropShadowImageFilter(ctx, materializedProps);
      break;
    case NodeType.DisplacementMapImageFilter:
      renderDisplacementMapImageFilter(ctx, materializedProps);
      break;
    case NodeType.RuntimeShaderImageFilter:
      renderRuntimeShaderImageFilter(ctx, materializedProps);
      break;
    case NodeType.MorphologyImageFilter:
      renderMorphologyImageFilter(ctx, materializedProps);
      break;
    case NodeType.MatrixColorFilter:
      renderMatrixColorFilter(ctx, materializedProps);
      break;
    case NodeType.BlendColorFilter:
      renderBlendColorFilter(ctx, materializedProps);
      break;
    case NodeType.LinearToSRGBGammaColorFilter:
      renderLinearToSRGBGammaColorFilter(ctx, materializedProps);
      break;
    case NodeType.SRGBToLinearGammaColorFilter:
      renderSRGBToLinearGammaColorFilter(ctx, materializedProps);
      break;
    case NodeType.LumaColorFilter:
      renderLumaColorFilter(ctx, materializedProps);
      break;
    case NodeType.LerpColorFilter:
      renderLerpColorFilter(ctx, materializedProps);
      break;
    case NodeType.Shader:
      renderShader(ctx, materializedProps);
      break;
    case NodeType.ImageShader:
      renderImageShader(ctx, materializedProps);
      break;
    case NodeType.ColorShader:
      renderColorShader(ctx, materializedProps);
      break;
    case NodeType.Turbulence:
      renderTurbulence(ctx, materializedProps);
      break;
    case NodeType.FractalNoise:
      renderFractalNoise(ctx, materializedProps);
      break;
    case NodeType.LinearGradient:
      renderLinearGradient(ctx, materializedProps);
      break;
    case NodeType.RadialGradient:
      renderRadialGradient(ctx, materializedProps);
      break;
    case NodeType.SweepGradient:
      renderSweepGradient(ctx, materializedProps);
      break;
    case NodeType.TwoPointConicalGradient:
      renderTwoPointConicalGradient(ctx, materializedProps);
      break;
    case NodeType.DiscretePathEffect:
      renderDiscretePathEffect(ctx, materializedProps);
      break;
    case NodeType.DashPathEffect:
      renderDashPathEffect(ctx, materializedProps);
      break;
    case NodeType.Path1DPathEffect:
      renderPath1DPathEffect(ctx, materializedProps);
      break;
    case NodeType.Path2DPathEffect:
      renderPath2DPathEffect(ctx, materializedProps);
      break;
    case NodeType.CornerPathEffect:
      renderCornerPathEffect(ctx, materializedProps);
      break;
    case NodeType.SumPathEffect:
      renderSumPathEffect(ctx, materializedProps);
      break;
    case NodeType.Line2DPathEffect:
      renderLine2DPathEffect(ctx, materializedProps);
      break;
    case NodeType.Blend:
      renderBlend(ctx, materializedProps);
      break;
    case NodeType.BackdropFilter:
      renderBackdropFilter(ctx, materializedProps);
      break;
    case NodeType.Box:
      renderBox(ctx, materializedProps);
      break;
    case NodeType.BoxShadow:
      renderBoxShadow(ctx, materializedProps);
      break;
    case NodeType.Paragraph:
      renderParagraph(ctx, materializedProps);
      break;
    default:
      return exhaustiveCheck(node.type);
  }
  if (restore) {
    ctx.canvas.restore();
  }
  if (restorePaint) {
    //ctx.paint.restore();
  }
};
