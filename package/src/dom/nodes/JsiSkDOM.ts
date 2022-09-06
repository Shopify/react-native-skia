import type { Skia } from "../../skia/types";
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
} from "../types";
import type {
  BlendImageFilterProps,
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

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props ?? {});
  }

  Paint(props: PaintProps) {
    return new PaintNode(this.Skia, props);
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return new FillNode(this.Skia, props);
  }

  Image(props: ImageProps) {
    return new ImageNode(this.Skia, props);
  }

  Circle(props: CircleProps) {
    return new CircleNode(this.Skia, props);
  }

  Path(props: PathProps) {
    return new PathNode(this.Skia, props);
  }

  CustomDrawing(props: CustomDrawingNodeProps) {
    return new CustomDrawingNode(this.Skia, props);
  }

  Line(props: LineProps) {
    return new LineNode(this.Skia, props);
  }

  Oval(props: OvalProps) {
    return new OvalNode(this.Skia, props);
  }

  Patch(props: PatchProps) {
    return new PatchNode(this.Skia, props);
  }

  Points(props: PointsProps) {
    return new PointsNode(this.Skia, props);
  }

  Rect(props: RectProps) {
    return new RectNode(this.Skia, props);
  }

  RRect(props: RoundedRectProps) {
    return new RRectNode(this.Skia, props);
  }

  Vertices(props: VerticesProps) {
    return new VerticesNode(this.Skia, props);
  }

  Text(props: TextProps) {
    return new TextNode(this.Skia, props);
  }

  TextPath(props: TextPathProps) {
    return new TextPathNode(this.Skia, props);
  }

  TextBlob(props: TextBlobProps) {
    return new TextBlobNode(this.Skia, props);
  }

  Glyphs(props: GlyphsProps) {
    return new GlyphsNode(this.Skia, props);
  }

  DiffRect(props: DiffRectProps) {
    return new DiffRectNode(this.Skia, props);
  }

  Picture(props: PictureProps) {
    return new PictureNode(this.Skia, props);
  }

  ImageSVG(props: ImageSVGProps) {
    return new ImageSVGNode(this.Skia, props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return new BlurMaskFilterNode(this.Skia, props);
  }

  // ImageFilters
  BlendImageFilter(props: BlendImageFilterProps) {
    return new BlendImageFilterNode(this.Skia, props);
  }

  DropShadowImageFilter(props: DropShadowImageFilterProps) {
    return new DropShadowImageFilterNode(this.Skia, props);
  }

  DisplacementMapImageFilter(props: DisplacementMapImageFilterProps) {
    return new DisplacementMapImageFilterNode(this.Skia, props);
  }

  BlurImageFilter(props: BlurImageFilterProps) {
    return new BlurImageFilterNode(this.Skia, props);
  }

  OffsetImageFilter(props: OffsetImageFilterProps) {
    return new OffsetImageFilterNode(this.Skia, props);
  }

  MorphologyImageFilter(props: MorphologyImageFilterProps) {
    return new MorphologyImageFilterNode(this.Skia, props);
  }

  RuntimeShaderImageFilter(props: RuntimeShaderImageFilterProps) {
    return new RuntimeShaderImageFilterNode(this.Skia, props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return new MatrixColorFilterNode(this.Skia, props);
  }

  BlendColorFilter(props: BlendColorFilterProps) {
    return new BlendColorFilterNode(this.Skia, props);
  }

  LumaColorFilter() {
    return new LumaColorFilterNode(this.Skia);
  }

  LinearToSRGBGammaColorFilter() {
    return new LinearToSRGBGammaColorFilterNode(this.Skia);
  }

  SRGBToLinearGammaColorFilter() {
    return new SRGBToLinearGammaColorFilterNode(this.Skia);
  }

  LerpColorFilter(props: LerpColorFilterProps) {
    return new LerpColorFilterNode(this.Skia, props);
  }

  // Shaders
  Shader(props: ShaderProps) {
    return new ShaderNode(this.Skia, props);
  }

  ImageShader(props: ImageShaderProps) {
    return new ImageShaderNode(this.Skia, props);
  }

  ColorShader(props: ColorProps) {
    return new ColorNode(this.Skia, props);
  }

  SweepGradient(props: SweepGradientProps) {
    return new SweepGradientNode(this.Skia, props);
  }

  Turbulence(props: TurbulenceProps) {
    return new TurbulenceNode(this.Skia, props);
  }

  FractalNoise(props: FractalNoiseProps) {
    return new FractalNoiseNode(this.Skia, props);
  }

  LinearGradient(props: LinearGradientProps) {
    return new LinearGradientNode(this.Skia, props);
  }

  RadialGradient(props: RadialGradientProps) {
    return new RadialGradientNode(this.Skia, props);
  }

  TwoPointConicalGradient(props: TwoPointConicalGradientProps) {
    return new TwoPointConicalGradientNode(this.Skia, props);
  }

  // Path Effects
  CornerPathEffect(props: CornerPathEffectProps) {
    return new CornerPathEffectNode(this.Skia, props);
  }

  DiscretePathEffect(props: DiscretePathEffectProps) {
    return new DiscretePathEffectNode(this.Skia, props);
  }

  DashPathEffect(props: DashPathEffectProps) {
    return new DashPathEffectNode(this.Skia, props);
  }

  Path1DPathEffect(props: Path1DPathEffectProps) {
    return new Path1DPathEffectNode(this.Skia, props);
  }

  Path2DPathEffect(props: Path2DPathEffectProps) {
    return new Path2DPathEffectNode(this.Skia, props);
  }

  SumPathEffect() {
    return new SumPathEffectNode(this.Skia);
  }

  Line2DPathEffect(props: Line2DPathEffectProps) {
    return new Line2DPathEffectNode(this.Skia, props);
  }
}
