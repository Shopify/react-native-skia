import type {
  PathProps,
  SkDOM,
  GroupProps,
  ImageProps,
  BlurImageFilterProps,
  MatrixColorFilterProps,
  CircleProps,
  BlurMaskFilterProps,
  LinearGradientProps,
  PaintProps,
  ShaderProps,
  ImageShaderProps,
  CustomDrawingNodeProps,
  LineProps,
  OvalProps,
  PatchProps,
  PointsProps,
  RectProps,
  RoundedRectProps,
  VerticesProps,
  TextProps,
  DiffRectProps,
  OffsetImageFilterProps,
  BlendColorFilterProps,
  TextPathProps,
  TextBlobProps,
  GlyphsProps,
  TwoPointConicalGradientProps,
  TurbulenceProps,
  SweepGradientProps,
  RadialGradientProps,
  FractalNoiseProps,
  ColorProps,
  PictureProps,
  ImageSVGProps,
  LerpColorFilterProps,
  DrawingNodeProps,
  BoxProps,
  BoxShadowProps,
  ChildrenProps,
} from "../types";
import type {
  BlendImageFilterProps,
  BlendProps,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../types/ImageFilters";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "../types/PathEffects";

import {
  FillNode,
  ImageNode,
  CircleNode,
  PathNode,
  LineNode,
  PatchNode,
  PointsNode,
  RectNode,
  RRectNode,
  VerticesNode,
  TextNode,
  OvalNode,
  CustomDrawingNode,
  TextPathNode,
  TextBlobNode,
  GlyphsNode,
  DiffRectNode,
  PictureNode,
  ImageSVGNode,
  BackdropFilterNode,
  BoxNode,
  BoxShadowNode,
} from "./drawings";
import {
  BlendImageFilterNode,
  BlurImageFilterNode,
  BlurMaskFilterNode,
  DisplacementMapImageFilterNode,
  DropShadowImageFilterNode,
  OffsetImageFilterNode,
  RuntimeShaderImageFilterNode,
  CornerPathEffectNode,
  DiscretePathEffectNode,
  DashPathEffectNode,
  Path1DPathEffectNode,
  Path2DPathEffectNode,
  SumPathEffectNode,
  Line2DPathEffectNode,
  BlendNode,
} from "./paint";
import {
  MatrixColorFilterNode,
  LumaColorFilterNode,
  LinearToSRGBGammaColorFilterNode,
  SRGBToLinearGammaColorFilterNode,
  BlendColorFilterNode,
  LerpColorFilterNode,
} from "./paint/ColorFilters";
import {
  LinearGradientNode,
  ShaderNode,
  ImageShaderNode,
  TwoPointConicalGradientNode,
  TurbulenceNode,
  SweepGradientNode,
  RadialGradientNode,
  FractalNoiseNode,
  ColorNode,
} from "./paint/Shaders";
import { MorphologyImageFilterNode } from "./paint/ImageFilters";
import { GroupNode } from "./GroupNode";
import { PaintNode } from "./PaintNode";
import type { NodeContext } from "./Node";

export class JsiSkDOM implements SkDOM {
  constructor(private ctx: NodeContext) {}

  Group(props?: GroupProps) {
    return global.SkiaDomApi && global.SkiaDomApi.GroupNode
      ? global.SkiaDomApi.GroupNode(props ?? {})
      : new GroupNode(this.ctx, props ?? {});
  }

  Paint(props: PaintProps) {
    return global.SkiaDomApi && global.SkiaDomApi.PaintNode
      ? global.SkiaDomApi.PaintNode(props ?? {})
      : new PaintNode(this.ctx, props);
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return global.SkiaDomApi && global.SkiaDomApi.FillNode
      ? global.SkiaDomApi.FillNode(props ?? {})
      : new FillNode(this.ctx, props);
  }

  Image(props: ImageProps) {
    return global.SkiaDomApi && global.SkiaDomApi.ImageNode
      ? global.SkiaDomApi.ImageNode(props ?? {})
      : new ImageNode(this.ctx, props);
  }

  Circle(props: CircleProps) {
    return global.SkiaDomApi && global.SkiaDomApi.CircleNode
      ? global.SkiaDomApi.CircleNode(props ?? {})
      : new CircleNode(this.ctx, props);
  }

  Path(props: PathProps) {
    return global.SkiaDomApi && global.SkiaDomApi.PathNode
      ? global.SkiaDomApi.PathNode(props ?? {})
      : new PathNode(this.ctx, props);
  }

  CustomDrawing(props: CustomDrawingNodeProps) {
    return new CustomDrawingNode(this.ctx, props);
  }

  Line(props: LineProps) {
    return global.SkiaDomApi && global.SkiaDomApi.LineNode
      ? global.SkiaDomApi.LineNode(props ?? {})
      : new LineNode(this.ctx, props);
  }

  Oval(props: OvalProps) {
    return global.SkiaDomApi && global.SkiaDomApi.OvalNode
      ? global.SkiaDomApi.OvalNode(props ?? {})
      : new OvalNode(this.ctx, props);
  }

  Patch(props: PatchProps) {
    return new PatchNode(this.ctx, props);
  }

  Points(props: PointsProps) {
    return global.SkiaDomApi && global.SkiaDomApi.PointsNode
      ? global.SkiaDomApi.PointsNode(props ?? {})
      : new PointsNode(this.ctx, props);
  }

  Rect(props: RectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.RectNode
      ? global.SkiaDomApi.RectNode(props)
      : new RectNode(this.ctx, props);
  }

  RRect(props: RoundedRectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.RRectNode
      ? global.SkiaDomApi.RRectNode(props)
      : new RRectNode(this.ctx, props);
  }

  Vertices(props: VerticesProps) {
    return new VerticesNode(this.ctx, props);
  }

  Text(props: TextProps) {
    return new TextNode(this.ctx, props);
  }

  TextPath(props: TextPathProps) {
    return new TextPathNode(this.ctx, props);
  }

  TextBlob(props: TextBlobProps) {
    return new TextBlobNode(this.ctx, props);
  }

  Glyphs(props: GlyphsProps) {
    return new GlyphsNode(this.ctx, props);
  }

  DiffRect(props: DiffRectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.DiffRectNode
      ? global.SkiaDomApi.DiffRectNode(props)
      : new DiffRectNode(this.ctx, props);
  }

  Picture(props: PictureProps) {
    return new PictureNode(this.ctx, props);
  }

  ImageSVG(props: ImageSVGProps) {
    return new ImageSVGNode(this.ctx, props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.BlurMaskFilterNode
      ? global.SkiaDomApi.BlurMaskFilterNode(props)
      : new BlurMaskFilterNode(this.ctx, props);
  }

  // ImageFilters
  BlendImageFilter(props: BlendImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.BlendImageFilterNode
      ? global.SkiaDomApi.BlendImageFilterNode(props)
      : new BlendImageFilterNode(this.ctx, props);
  }

  DropShadowImageFilter(props: DropShadowImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.DropShadowImageFilterNode
      ? global.SkiaDomApi.DropShadowImageFilterNode(props)
      : new DropShadowImageFilterNode(this.ctx, props);
  }

  DisplacementMapImageFilter(props: DisplacementMapImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.DisplacementMapImageFilterNode
      ? global.SkiaDomApi.DisplacementMapImageFilterNode(props)
      : new DisplacementMapImageFilterNode(this.ctx, props);
  }

  BlurImageFilter(props: BlurImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.BlurImageFilterNode
      ? global.SkiaDomApi.BlurImageFilterNode(props)
      : new BlurImageFilterNode(this.ctx, props);
  }

  OffsetImageFilter(props: OffsetImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.OffsetImageFilterNode
      ? global.SkiaDomApi.OffsetImageFilterNode(props)
      : new OffsetImageFilterNode(this.ctx, props);
  }

  MorphologyImageFilter(props: MorphologyImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.MorphologyImageFilterNode
      ? global.SkiaDomApi.MorphologyImageFilterNode(props)
      : new MorphologyImageFilterNode(this.ctx, props);
  }

  RuntimeShaderImageFilter(props: RuntimeShaderImageFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.RuntimeShaderImageFilterNode
      ? global.SkiaDomApi.RuntimeShaderImageFilterNode(props)
      : new RuntimeShaderImageFilterNode(this.ctx, props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.MatrixColorFilterNode
      ? global.SkiaDomApi.MatrixColorFilterNode(props)
      : new MatrixColorFilterNode(this.ctx, props);
  }

  BlendColorFilter(props: BlendColorFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.BlendColorFilterNode
      ? global.SkiaDomApi.BlendColorFilterNode(props)
      : new BlendColorFilterNode(this.ctx, props);
  }

  LumaColorFilter() {
    return global.SkiaDomApi && global.SkiaDomApi.LumaColorFilterNode
      ? global.SkiaDomApi.LumaColorFilterNode()
      : new LumaColorFilterNode(this.ctx);
  }

  LinearToSRGBGammaColorFilter() {
    return global.SkiaDomApi &&
      global.SkiaDomApi.LinearToSRGBGammaColorFilterNode
      ? global.SkiaDomApi.LinearToSRGBGammaColorFilterNode()
      : new LinearToSRGBGammaColorFilterNode(this.ctx);
  }

  SRGBToLinearGammaColorFilter() {
    return global.SkiaDomApi &&
      global.SkiaDomApi.SRGBToLinearGammaColorFilterNode
      ? global.SkiaDomApi.SRGBToLinearGammaColorFilterNode()
      : new SRGBToLinearGammaColorFilterNode(this.ctx);
  }

  LerpColorFilter(props: LerpColorFilterProps) {
    return global.SkiaDomApi && global.SkiaDomApi.LerpColorFilterNode
      ? global.SkiaDomApi.LerpColorFilterNode(props)
      : new LerpColorFilterNode(this.ctx, props);
  }

  // Shaders
  Shader(props: ShaderProps) {
    return global.SkiaDomApi && global.SkiaDomApi.ShaderNode
      ? global.SkiaDomApi.ShaderNode(props)
      : new ShaderNode(this.ctx, props);
  }

  ImageShader(props: ImageShaderProps) {
    return global.SkiaDomApi && global.SkiaDomApi.ImageShaderNode
      ? global.SkiaDomApi.ImageShaderNode(props)
      : new ImageShaderNode(this.ctx, props);
  }

  ColorShader(props: ColorProps) {
    return global.SkiaDomApi && global.SkiaDomApi.ColorShaderNode
      ? global.SkiaDomApi.ColorShaderNode(props)
      : new ColorNode(this.ctx, props);
  }

  SweepGradient(props: SweepGradientProps) {
    return global.SkiaDomApi && global.SkiaDomApi.SweepGradientNode
      ? global.SkiaDomApi.SweepGradientNode(props)
      : new SweepGradientNode(this.ctx, props);
  }

  Turbulence(props: TurbulenceProps) {
    return global.SkiaDomApi && global.SkiaDomApi.TurbulenceNode
      ? global.SkiaDomApi.TurbulenceNode(props)
      : new TurbulenceNode(this.ctx, props);
  }

  FractalNoise(props: FractalNoiseProps) {
    return global.SkiaDomApi && global.SkiaDomApi.FractalNoiseNode
      ? global.SkiaDomApi.FractalNoiseNode(props)
      : new FractalNoiseNode(this.ctx, props);
  }

  LinearGradient(props: LinearGradientProps) {
    return global.SkiaDomApi && global.SkiaDomApi.LinearGradientNode
      ? global.SkiaDomApi.LinearGradientNode(props)
      : new LinearGradientNode(this.ctx, props);
  }

  RadialGradient(props: RadialGradientProps) {
    return global.SkiaDomApi && global.SkiaDomApi.RadialGradientNode
      ? global.SkiaDomApi.RadialGradientNode(props)
      : new RadialGradientNode(this.ctx, props);
  }

  TwoPointConicalGradient(props: TwoPointConicalGradientProps) {
    return global.SkiaDomApi && global.SkiaDomApi.TwoPointConicalGradientNode
      ? global.SkiaDomApi.TwoPointConicalGradientNode(props)
      : new TwoPointConicalGradientNode(this.ctx, props);
  }

  // Path Effects
  CornerPathEffect(props: CornerPathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.CornerPathEffectNode
      ? global.SkiaDomApi.CornerPathEffectNode(props)
      : new CornerPathEffectNode(this.ctx, props);
  }

  DiscretePathEffect(props: DiscretePathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.DiscretePathEffectNode
      ? global.SkiaDomApi.DiscretePathEffectNode(props)
      : new DiscretePathEffectNode(this.ctx, props);
  }

  DashPathEffect(props: DashPathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.DashPathEffectNode
      ? global.SkiaDomApi.DashPathEffectNode(props)
      : new DashPathEffectNode(this.ctx, props);
  }

  Path1DPathEffect(props: Path1DPathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.Path1DPathEffectNode
      ? global.SkiaDomApi.Path1DPathEffectNode(props)
      : new Path1DPathEffectNode(this.ctx, props);
  }

  Path2DPathEffect(props: Path2DPathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.Path2DPathEffectNode
      ? global.SkiaDomApi.Path2DPathEffectNode(props)
      : new Path2DPathEffectNode(this.ctx, props);
  }

  SumPathEffect() {
    return global.SkiaDomApi && global.SkiaDomApi.SumPathEffectNode
      ? global.SkiaDomApi.SumPathEffectNode()
      : new SumPathEffectNode(this.ctx);
  }

  Line2DPathEffect(props: Line2DPathEffectProps) {
    return global.SkiaDomApi && global.SkiaDomApi.Line2DPathEffectNode
      ? global.SkiaDomApi.Line2DPathEffectNode(props)
      : new Line2DPathEffectNode(this.ctx, props);
  }

  Blend(props: BlendProps) {
    return new BlendNode(this.ctx, props);
  }

  BackdropFilter(props: ChildrenProps) {
    return new BackdropFilterNode(this.ctx, props);
  }

  Box(props: BoxProps) {
    return new BoxNode(this.ctx, props);
  }

  BoxShadow(props: BoxShadowProps) {
    return new BoxShadowNode(this.ctx, props);
  }
}
