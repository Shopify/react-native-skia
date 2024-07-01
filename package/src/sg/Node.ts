import type {
  ChildrenProps,
  DrawingNodeProps,
  GroupProps,
  PaintProps,
  ImageProps,
  CircleProps,
  PathProps,
  LineProps,
  OvalProps,
  PatchProps,
  PointsProps,
  RectProps,
  RoundedRectProps,
  AtlasProps,
  VerticesProps,
  TextProps,
  TextPathProps,
  TextBlobProps,
  GlyphsProps,
  DiffRectProps,
  PictureProps,
  ImageSVGProps,
  BlurMaskFilterProps,
  BlendImageFilterProps,
  BlurImageFilterProps,
  OffsetImageFilterProps,
  DropShadowImageFilterProps,
  DisplacementMapImageFilterProps,
  RuntimeShaderImageFilterProps,
  MorphologyImageFilterProps,
  MatrixColorFilterProps,
  BlendColorFilterProps,
  LerpColorFilterProps,
  ShaderProps,
  ImageShaderProps,
  TurbulenceProps,
  FractalNoiseProps,
  LinearGradientProps,
  RadialGradientProps,
  SweepGradientProps,
  TwoPointConicalGradientProps,
  DiscretePathEffectProps,
  DashPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
  CornerPathEffectProps,
  Line2DPathEffectProps,
  BlendProps,
  BoxProps,
  BoxShadowProps,
  ParagraphProps,
  ColorProps,
  NodeType,
} from "../dom/types";
import type { AnimatedProps, BackdropFilterProps } from "../renderer";

export interface PropMap {
  [NodeType.Group]: GroupProps;
  [NodeType.Layer]: ChildrenProps;
  [NodeType.Paint]: PaintProps;
  [NodeType.Fill]: DrawingNodeProps;
  [NodeType.Image]: ImageProps;
  [NodeType.Circle]: CircleProps;
  [NodeType.Path]: PathProps;
  [NodeType.Line]: LineProps;
  [NodeType.Oval]: OvalProps;
  [NodeType.Patch]: PatchProps;
  [NodeType.Points]: PointsProps;
  [NodeType.Rect]: RectProps;
  [NodeType.RRect]: RoundedRectProps;
  [NodeType.Atlas]: AtlasProps;
  [NodeType.Vertices]: VerticesProps;
  [NodeType.Text]: TextProps;
  [NodeType.TextPath]: TextPathProps;
  [NodeType.TextBlob]: TextBlobProps;
  [NodeType.Glyphs]: GlyphsProps;
  [NodeType.DiffRect]: DiffRectProps;
  [NodeType.Picture]: PictureProps;
  [NodeType.ImageSVG]: ImageSVGProps;
  [NodeType.BlurMaskFilter]: BlurMaskFilterProps;
  [NodeType.BlendImageFilter]: BlendImageFilterProps;
  [NodeType.BlurImageFilter]: BlurImageFilterProps;
  [NodeType.OffsetImageFilter]: OffsetImageFilterProps;
  [NodeType.DropShadowImageFilter]: DropShadowImageFilterProps;
  [NodeType.DisplacementMapImageFilter]: DisplacementMapImageFilterProps;
  [NodeType.RuntimeShaderImageFilter]: RuntimeShaderImageFilterProps;
  [NodeType.MorphologyImageFilter]: MorphologyImageFilterProps;
  [NodeType.MatrixColorFilter]: MatrixColorFilterProps;
  [NodeType.BlendColorFilter]: BlendColorFilterProps;
  [NodeType.LinearToSRGBGammaColorFilter]: ChildrenProps;
  [NodeType.SRGBToLinearGammaColorFilter]: ChildrenProps;
  [NodeType.LumaColorFilter]: ChildrenProps;
  [NodeType.LerpColorFilter]: LerpColorFilterProps;
  [NodeType.Shader]: ShaderProps;
  [NodeType.ImageShader]: ImageShaderProps;
  [NodeType.ColorShader]: ColorProps;
  [NodeType.Turbulence]: TurbulenceProps;
  [NodeType.FractalNoise]: FractalNoiseProps;
  [NodeType.LinearGradient]: LinearGradientProps;
  [NodeType.RadialGradient]: RadialGradientProps;
  [NodeType.SweepGradient]: SweepGradientProps;
  [NodeType.TwoPointConicalGradient]: TwoPointConicalGradientProps;
  [NodeType.DiscretePathEffect]: DiscretePathEffectProps;
  [NodeType.DashPathEffect]: DashPathEffectProps;
  [NodeType.Path1DPathEffect]: Path1DPathEffectProps;
  [NodeType.Path2DPathEffect]: Path2DPathEffectProps;
  [NodeType.CornerPathEffect]: CornerPathEffectProps;
  [NodeType.SumPathEffect]: ChildrenProps;
  [NodeType.Line2DPathEffect]: Line2DPathEffectProps;
  [NodeType.Blend]: BlendProps;
  [NodeType.BackdropFilter]: BackdropFilterProps;
  [NodeType.Box]: BoxProps;
  [NodeType.BoxShadow]: BoxShadowProps;
  [NodeType.Paragraph]: ParagraphProps;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnknownProps = Record<string, any>;

export interface SGNode<P extends object = UnknownProps> {
  type: NodeType;
  props: AnimatedProps<P>;
  //  children?: SGNode[];
}

export const createNode = <T extends NodeType>(
  type: T,
  props: AnimatedProps<PropMap[T]>
): SGNode<PropMap[T]> => {
  "worklet";
  return { type, props };
};
