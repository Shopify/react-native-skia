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
  AtlasProps,
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
import type { ParagraphProps } from "../types/Paragraph";

export class JsiSkDOM implements SkDOM {
  constructor() {}

  Layer(props?: ChildrenProps) {
    return global.SkiaDomApi.LayerNode(props ?? {});
  }

  Group(props?: GroupProps) {
    return global.SkiaDomApi.GroupNode(props ?? {});
  }

  Paint(props: PaintProps) {
    return global.SkiaDomApi.PaintNode(props ?? {});
  }

  // Drawings
  Fill(props?: DrawingNodeProps) {
    return global.SkiaDomApi.FillNode(props ?? {});
  }

  Image(props: ImageProps) {
    return global.SkiaDomApi.ImageNode(props ?? {});
  }

  Circle(props: CircleProps) {
    return global.SkiaDomApi.CircleNode(props ?? {});
  }

  Path(props: PathProps) {
    return global.SkiaDomApi.PathNode(props ?? {});
  }

  Line(props: LineProps) {
    return global.SkiaDomApi.LineNode(props ?? {});
  }

  Oval(props: OvalProps) {
    return global.SkiaDomApi.OvalNode(props ?? {});
  }

  Patch(props: PatchProps) {
    return global.SkiaDomApi.PatchNode(props ?? {});
  }

  Points(props: PointsProps) {
    return global.SkiaDomApi.PointsNode(props ?? {});
  }

  Rect(props: RectProps) {
    return global.SkiaDomApi.RectNode(props);
  }

  RRect(props: RoundedRectProps) {
    return global.SkiaDomApi.RRectNode(props);
  }

  Vertices(props: VerticesProps) {
    return global.SkiaDomApi.VerticesNode(props);
  }

  Text(props: TextProps) {
    return global.SkiaDomApi.TextNode(props);
  }

  TextPath(props: TextPathProps) {
    return global.SkiaDomApi.TextPathNode(props);
  }

  TextBlob(props: TextBlobProps) {
    return global.SkiaDomApi.TextBlobNode(props);
  }

  Glyphs(props: GlyphsProps) {
    return global.SkiaDomApi.GlyphsNode(props);
  }

  DiffRect(props: DiffRectProps) {
    return global.SkiaDomApi.DiffRectNode(props);
  }

  Picture(props: PictureProps) {
    return global.SkiaDomApi.PictureNode(props);
  }

  Atlas(props: AtlasProps) {
    return global.SkiaDomApi.AtlasNode(props);
  }

  ImageSVG(props: ImageSVGProps) {
    return global.SkiaDomApi.ImageSVGNode(props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return global.SkiaDomApi.BlurMaskFilterNode(props);
  }

  // ImageFilters
  BlendImageFilter(props: BlendImageFilterProps) {
    return global.SkiaDomApi.BlendImageFilterNode(props);
  }

  DropShadowImageFilter(props: DropShadowImageFilterProps) {
    return global.SkiaDomApi.DropShadowImageFilterNode(props);
  }

  DisplacementMapImageFilter(props: DisplacementMapImageFilterProps) {
    return global.SkiaDomApi.DisplacementMapImageFilterNode(props);
  }

  BlurImageFilter(props: BlurImageFilterProps) {
    return global.SkiaDomApi.BlurImageFilterNode(props);
  }

  OffsetImageFilter(props: OffsetImageFilterProps) {
    return global.SkiaDomApi.OffsetImageFilterNode(props);
  }

  MorphologyImageFilter(props: MorphologyImageFilterProps) {
    return global.SkiaDomApi.MorphologyImageFilterNode(props);
  }

  RuntimeShaderImageFilter(props: RuntimeShaderImageFilterProps) {
    return global.SkiaDomApi.RuntimeShaderImageFilterNode(props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return global.SkiaDomApi.MatrixColorFilterNode(props);
  }

  BlendColorFilter(props: BlendColorFilterProps) {
    return global.SkiaDomApi.BlendColorFilterNode(props);
  }

  LumaColorFilter() {
    return global.SkiaDomApi.LumaColorFilterNode();
  }

  LinearToSRGBGammaColorFilter() {
    return global.SkiaDomApi.LinearToSRGBGammaColorFilterNode();
  }

  SRGBToLinearGammaColorFilter() {
    return global.SkiaDomApi.SRGBToLinearGammaColorFilterNode();
  }

  LerpColorFilter(props: LerpColorFilterProps) {
    return global.SkiaDomApi.LerpColorFilterNode(props);
  }

  // Shaders
  Shader(props: ShaderProps) {
    return global.SkiaDomApi.ShaderNode(props);
  }

  ImageShader(props: ImageShaderProps) {
    return global.SkiaDomApi.ImageShaderNode(props);
  }

  ColorShader(props: ColorProps) {
    return global.SkiaDomApi.ColorShaderNode(props);
  }

  SweepGradient(props: SweepGradientProps) {
    return global.SkiaDomApi.SweepGradientNode(props);
  }

  Turbulence(props: TurbulenceProps) {
    return global.SkiaDomApi.TurbulenceNode(props);
  }

  FractalNoise(props: FractalNoiseProps) {
    return global.SkiaDomApi.FractalNoiseNode(props);
  }

  LinearGradient(props: LinearGradientProps) {
    return global.SkiaDomApi.LinearGradientNode(props);
  }

  RadialGradient(props: RadialGradientProps) {
    return global.SkiaDomApi.RadialGradientNode(props);
  }

  TwoPointConicalGradient(props: TwoPointConicalGradientProps) {
    return global.SkiaDomApi.TwoPointConicalGradientNode(props);
  }

  // Path Effects
  CornerPathEffect(props: CornerPathEffectProps) {
    return global.SkiaDomApi.CornerPathEffectNode(props);
  }

  DiscretePathEffect(props: DiscretePathEffectProps) {
    return global.SkiaDomApi.DiscretePathEffectNode(props);
  }

  DashPathEffect(props: DashPathEffectProps) {
    return global.SkiaDomApi.DashPathEffectNode(props);
  }

  Path1DPathEffect(props: Path1DPathEffectProps) {
    return global.SkiaDomApi.Path1DPathEffectNode(props);
  }

  Path2DPathEffect(props: Path2DPathEffectProps) {
    return global.SkiaDomApi.Path2DPathEffectNode(props);
  }

  SumPathEffect() {
    return global.SkiaDomApi.SumPathEffectNode();
  }

  Line2DPathEffect(props: Line2DPathEffectProps) {
    return global.SkiaDomApi.Line2DPathEffectNode(props);
  }

  Blend(props: BlendProps) {
    return global.SkiaDomApi.BlendNode(props);
  }

  BackdropFilter(props: ChildrenProps) {
    return global.SkiaDomApi.BackdropFilterNode(props);
  }

  Box(props: BoxProps) {
    return global.SkiaDomApi.BoxNode(props);
  }

  BoxShadow(props: BoxShadowProps) {
    return global.SkiaDomApi.BoxShadowNode(props);
  }

  // Paragraph
  Paragraph(props: ParagraphProps) {
    return global.SkiaDomApi.ParagraphNode(props);
  }
}
