/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../../dom/types";
import { type DeclarationContext } from "../DeclarationContext";

import { type Node } from "./Node";
import {
  composeColorFilters,
  declareLerpColorFilter,
  makeBlendColorFilter,
  makeLinearToSRGBGammaColorFilter,
  makeLumaColorFilter,
  makeMatrixColorFilter,
  makeSRGBToLinearGammaColorFilter,
} from "./colorFilters";
import {
  composeImageFilters,
  declareBlend,
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
import { declarePaint } from "./paint";
import {
  composePathEffects,
  declareSumPathEffect,
  makeCornerPathEffect,
  makeDashPathEffect,
  makeDiscretePathEffect,
  makeLine2DPathEffect,
  makePath1DPathEffect,
  makePath2DPathEffect,
} from "./pathEffects";

export function processDeclarations(ctx: DeclarationContext, node: Node<any>) {
  "worklet";
  const processChildren = () =>
    node.children.forEach((child) => processDeclarations(ctx, child));
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
      processChildren();
      declareLerpColorFilter(ctx, props);
      break;
    }
    case NodeType.Blend: {
      processChildren();
      declareBlend(ctx, props);
      break;
    }
    case NodeType.BlendColorFilter: {
      const cf = makeBlendColorFilter(ctx, props);
      composeColorFilters(ctx, cf, processChildren);
      break;
    }
    case NodeType.SRGBToLinearGammaColorFilter: {
      const cf = makeSRGBToLinearGammaColorFilter(ctx);
      composeColorFilters(ctx, cf, processChildren);
      break;
    }
    case NodeType.LinearToSRGBGammaColorFilter: {
      const cf = makeLinearToSRGBGammaColorFilter(ctx);
      composeColorFilters(ctx, cf, processChildren);
      break;
    }
    case NodeType.MatrixColorFilter: {
      const cf = makeMatrixColorFilter(ctx, props);
      composeColorFilters(ctx, cf, processChildren);
      break;
    }
    case NodeType.LumaColorFilter: {
      const cf = makeLumaColorFilter(ctx);
      composeColorFilters(ctx, cf, processChildren);
      break;
    }
    // Shaders
    case NodeType.Shader: {
      processChildren();
      declareShader(ctx, props);
      break;
    }
    case NodeType.ImageShader: {
      declareImageShader(ctx, props);
      break;
    }
    case NodeType.ColorShader: {
      declareColorShader(ctx, props);
      break;
    }
    case NodeType.Turbulence: {
      declareTurbulenceShader(ctx, props);
      break;
    }
    case NodeType.FractalNoise: {
      declareFractalNoiseShader(ctx, props);
      break;
    }
    case NodeType.LinearGradient: {
      declareLinearGradientShader(ctx, props);
      break;
    }
    case NodeType.RadialGradient: {
      declareRadialGradientShader(ctx, props);
      break;
    }
    case NodeType.SweepGradient: {
      declareSweepGradientShader(ctx, props);
      break;
    }
    case NodeType.TwoPointConicalGradient: {
      declareTwoPointConicalGradientShader(ctx, props);
      break;
    }
    // Image Filters
    case NodeType.BlurImageFilter: {
      const imgf = makeBlurImageFilter(ctx, props);
      composeImageFilters(ctx, imgf, processChildren);
      break;
    }
    case NodeType.OffsetImageFilter: {
      const imgf = makeOffsetImageFilter(ctx, props);
      composeImageFilters(ctx, imgf, processChildren);
      break;
    }
    case NodeType.DisplacementMapImageFilter: {
      processChildren();
      declareDisplacementMapImageFilter(ctx, props);
      break;
    }
    case NodeType.DropShadowImageFilter: {
      const imgf = makeDropShadowImageFilter(ctx, props);
      composeImageFilters(ctx, imgf, processChildren);
      break;
    }
    case NodeType.MorphologyImageFilter: {
      const imgf = makeMorphologyImageFilter(ctx, props);
      composeImageFilters(ctx, imgf, processChildren);
      break;
    }
    case NodeType.BlendImageFilter: {
      processChildren();
      declareBlendImageFilter(ctx, props);
      break;
    }
    case NodeType.RuntimeShaderImageFilter: {
      const imgf = makeRuntimeShaderImageFilter(ctx, props);
      composeImageFilters(ctx, imgf, processChildren);
      break;
    }
    // Path Effects
    case NodeType.SumPathEffect: {
      processChildren();
      declareSumPathEffect(ctx);
      break;
    }
    case NodeType.CornerPathEffect: {
      const pf = makeCornerPathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    case NodeType.Path1DPathEffect: {
      const pf = makePath1DPathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    case NodeType.Path2DPathEffect: {
      const pf = makePath2DPathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    case NodeType.Line2DPathEffect: {
      const pf = makeLine2DPathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    case NodeType.DashPathEffect: {
      const pf = makeDashPathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    case NodeType.DiscretePathEffect: {
      const pf = makeDiscretePathEffect(ctx, props);
      composePathEffects(ctx, pf, processChildren);
      break;
    }
    // Paint
    case NodeType.Paint:
      processChildren();
      declarePaint(ctx, props);
      break;
    default:
      console.log("Unknown declaration node: ", type);
  }
}
