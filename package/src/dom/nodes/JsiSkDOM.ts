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
import { NATIVE_DOM } from "../../renderer/HostComponents";

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
import { LayerNode } from "./LayerNode";

export class JsiSkDOM implements SkDOM {
  constructor(private ctx: NodeContext) {}

  Layer(props?: ChildrenProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.LayerNode(props ?? {})
      : new LayerNode(this.ctx, props ?? {});
  }

  Group(props?: GroupProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.GroupNode(props ?? {})
      : new GroupNode(this.ctx, props ?? {});
  }

  Paint(props: PaintProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.PaintNode(props ?? {})
      : new PaintNode(this.ctx, props);
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.FillNode(props ?? {})
      : new FillNode(this.ctx, props);
  }

  Image(props: ImageProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.ImageNode(props ?? {})
      : new ImageNode(this.ctx, props);
  }

  Circle(props: CircleProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.CircleNode(props ?? {})
      : new CircleNode(this.ctx, props);
  }

  Path(props: PathProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.PathNode(props ?? {})
      : new PathNode(this.ctx, props);
  }

  CustomDrawing(props: CustomDrawingNodeProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.CustomDrawingNode(props ?? {})
      : new CustomDrawingNode(this.ctx, props);
  }

  Line(props: LineProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.LineNode(props ?? {})
      : new LineNode(this.ctx, props);
  }

  Oval(props: OvalProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.OvalNode(props ?? {})
      : new OvalNode(this.ctx, props);
  }

  Patch(props: PatchProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.PatchNode(props ?? {})
      : new PatchNode(this.ctx, props);
  }

  Points(props: PointsProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.PointsNode(props ?? {})
      : new PointsNode(this.ctx, props);
  }

  Rect(props: RectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.RectNode(props)
      : new RectNode(this.ctx, props);
  }

  RRect(props: RoundedRectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.RRectNode(props)
      : new RRectNode(this.ctx, props);
  }

  Vertices(props: VerticesProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.VerticesNode(props)
      : new VerticesNode(this.ctx, props);
  }

  Text(props: TextProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.TextNode(props)
      : new TextNode(this.ctx, props);
  }

  TextPath(props: TextPathProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.TextPathNode(props)
      : new TextPathNode(this.ctx, props);
  }

  TextBlob(props: TextBlobProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.TextBlobNode(props)
      : new TextBlobNode(this.ctx, props);
  }

  Glyphs(props: GlyphsProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.GlyphsNode(props)
      : new GlyphsNode(this.ctx, props);
  }

  DiffRect(props: DiffRectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.DiffRectNode(props)
      : new DiffRectNode(this.ctx, props);
  }

  Picture(props: PictureProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.PictureNode(props)
      : new PictureNode(this.ctx, props);
  }

  ImageSVG(props: ImageSVGProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.ImageSVGNode(props)
      : new ImageSVGNode(this.ctx, props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BlurMaskFilterNode(props)
      : new BlurMaskFilterNode(this.ctx, props);
  }

  // ImageFilters
  BlendImageFilter(props: BlendImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BlendImageFilterNode(props)
      : new BlendImageFilterNode(this.ctx, props);
  }

  DropShadowImageFilter(props: DropShadowImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.DropShadowImageFilterNode(props)
      : new DropShadowImageFilterNode(this.ctx, props);
  }

  DisplacementMapImageFilter(props: DisplacementMapImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.DisplacementMapImageFilterNode(props)
      : new DisplacementMapImageFilterNode(this.ctx, props);
  }

  BlurImageFilter(props: BlurImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BlurImageFilterNode(props)
      : new BlurImageFilterNode(this.ctx, props);
  }

  OffsetImageFilter(props: OffsetImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.OffsetImageFilterNode(props)
      : new OffsetImageFilterNode(this.ctx, props);
  }

  MorphologyImageFilter(props: MorphologyImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.MorphologyImageFilterNode(props)
      : new MorphologyImageFilterNode(this.ctx, props);
  }

  RuntimeShaderImageFilter(props: RuntimeShaderImageFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.RuntimeShaderImageFilterNode(props)
      : new RuntimeShaderImageFilterNode(this.ctx, props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.MatrixColorFilterNode(props)
      : new MatrixColorFilterNode(this.ctx, props);
  }

  BlendColorFilter(props: BlendColorFilterProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BlendColorFilterNode(props)
      : new BlendColorFilterNode(this.ctx, props);
  }

  LumaColorFilter() {
    return NATIVE_DOM
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
    return NATIVE_DOM
      ? global.SkiaDomApi.LerpColorFilterNode(props)
      : new LerpColorFilterNode(this.ctx, props);
  }

  // Shaders
  Shader(props: ShaderProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.ShaderNode(props)
      : new ShaderNode(this.ctx, props);
  }

  ImageShader(props: ImageShaderProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.ImageShaderNode(props)
      : new ImageShaderNode(this.ctx, props);
  }

  ColorShader(props: ColorProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.ColorShaderNode(props)
      : new ColorNode(this.ctx, props);
  }

  SweepGradient(props: SweepGradientProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.SweepGradientNode(props)
      : new SweepGradientNode(this.ctx, props);
  }

  Turbulence(props: TurbulenceProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.TurbulenceNode(props)
      : new TurbulenceNode(this.ctx, props);
  }

  FractalNoise(props: FractalNoiseProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.FractalNoiseNode(props)
      : new FractalNoiseNode(this.ctx, props);
  }

  LinearGradient(props: LinearGradientProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.LinearGradientNode(props)
      : new LinearGradientNode(this.ctx, props);
  }

  RadialGradient(props: RadialGradientProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.RadialGradientNode(props)
      : new RadialGradientNode(this.ctx, props);
  }

  TwoPointConicalGradient(props: TwoPointConicalGradientProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.TwoPointConicalGradientNode(props)
      : new TwoPointConicalGradientNode(this.ctx, props);
  }

  // Path Effects
  CornerPathEffect(props: CornerPathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.CornerPathEffectNode(props)
      : new CornerPathEffectNode(this.ctx, props);
  }

  DiscretePathEffect(props: DiscretePathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.DiscretePathEffectNode(props)
      : new DiscretePathEffectNode(this.ctx, props);
  }

  DashPathEffect(props: DashPathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.DashPathEffectNode(props)
      : new DashPathEffectNode(this.ctx, props);
  }

  Path1DPathEffect(props: Path1DPathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.Path1DPathEffectNode(props)
      : new Path1DPathEffectNode(this.ctx, props);
  }

  Path2DPathEffect(props: Path2DPathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.Path2DPathEffectNode(props)
      : new Path2DPathEffectNode(this.ctx, props);
  }

  SumPathEffect() {
    return NATIVE_DOM
      ? global.SkiaDomApi.SumPathEffectNode()
      : new SumPathEffectNode(this.ctx);
  }

  Line2DPathEffect(props: Line2DPathEffectProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.Line2DPathEffectNode(props)
      : new Line2DPathEffectNode(this.ctx, props);
  }

  Blend(props: BlendProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BlendNode(props)
      : new BlendNode(this.ctx, props);
  }

  BackdropFilter(props: ChildrenProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BackdropFilterNode(props)
      : new BackdropFilterNode(this.ctx, props);
  }

  Box(props: BoxProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BoxNode(props)
      : new BoxNode(this.ctx, props);
  }

  BoxShadow(props: BoxShadowProps) {
    return NATIVE_DOM
      ? global.SkiaDomApi.BoxShadowNode(props)
      : new BoxShadowNode(this.ctx, props);
  }
}
