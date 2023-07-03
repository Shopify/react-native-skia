import type { ChildrenProps, GroupProps, PaintProps } from "./Common";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  DropShadowImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
  DisplacementMapImageFilterProps,
  MorphologyImageFilterProps,
  BlendProps,
} from "./ImageFilters";
import type { DeclarationNode, RenderNode } from "./Node";
import type {
  BlendColorFilterProps,
  MatrixColorFilterProps,
  LerpColorFilterProps,
} from "./ColorFilters";
import type {
  ImageProps,
  CircleProps,
  PathProps,
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
  TextPathProps,
  TextBlobProps,
  GlyphsProps,
  PictureProps,
  ImageSVGProps,
  DrawingNodeProps,
  BoxProps,
  BoxShadowProps,
} from "./Drawings";
import type { BlurMaskFilterProps } from "./MaskFilters";
import type {
  FractalNoiseProps,
  SweepGradientProps,
  ImageShaderProps,
  LinearGradientProps,
  ShaderProps,
  TurbulenceProps,
  TwoPointConicalGradientProps,
  RadialGradientProps,
  ColorProps,
} from "./Shaders";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "./PathEffects";

type ImageFilterNode<P> = DeclarationNode<P>;

type PathEffectNode<P> = DeclarationNode<P>;
type NullablePathEffectNode<P> = DeclarationNode<P>;

type DrawingNode<P extends GroupProps> = RenderNode<P>;

export interface SkDOM {
  Layer(props?: ChildrenProps): RenderNode<ChildrenProps>;
  Group(props?: GroupProps): RenderNode<GroupProps>;
  Paint(props: PaintProps): DeclarationNode<PaintProps>;

  // Drawings
  Fill(props?: DrawingNodeProps): DrawingNode<DrawingNodeProps>;
  Image(props: ImageProps): DrawingNode<ImageProps>;
  Circle(props: CircleProps): DrawingNode<CircleProps>;
  Path(props: PathProps): DrawingNode<PathProps>;
  CustomDrawing(
    props: CustomDrawingNodeProps
  ): DrawingNode<CustomDrawingNodeProps>;
  Line(props: LineProps): DrawingNode<LineProps>;
  Oval(props: OvalProps): DrawingNode<OvalProps>;
  Patch(props: PatchProps): DrawingNode<PatchProps>;
  Points(props: PointsProps): DrawingNode<PointsProps>;
  Rect(props: RectProps): DrawingNode<RectProps>;
  RRect(props: RoundedRectProps): DrawingNode<RoundedRectProps>;
  Vertices(props: VerticesProps): DrawingNode<VerticesProps>;
  Text(props: TextProps): DrawingNode<TextProps>;
  TextPath(props: TextPathProps): DrawingNode<TextPathProps>;
  TextBlob(props: TextBlobProps): DrawingNode<TextBlobProps>;
  Glyphs(props: GlyphsProps): DrawingNode<GlyphsProps>;
  DiffRect(props: DiffRectProps): DrawingNode<DiffRectProps>;
  Picture(props: PictureProps): DrawingNode<PictureProps>;
  ImageSVG(props: ImageSVGProps): DrawingNode<ImageSVGProps>;

  // BlurMaskFilters
  BlurMaskFilter(
    props: BlurMaskFilterProps
  ): DeclarationNode<BlurMaskFilterProps>;

  // ImageFilters
  BlendImageFilter(
    props: BlendImageFilterProps
  ): ImageFilterNode<BlendImageFilterProps>;
  BlurImageFilter(
    props: BlurImageFilterProps
  ): ImageFilterNode<BlurImageFilterProps>;
  OffsetImageFilter(
    props: OffsetImageFilterProps
  ): ImageFilterNode<OffsetImageFilterProps>;
  DropShadowImageFilter(
    props: DropShadowImageFilterProps
  ): ImageFilterNode<DropShadowImageFilterProps>;
  MorphologyImageFilter(
    props: MorphologyImageFilterProps
  ): ImageFilterNode<MorphologyImageFilterProps>;
  DisplacementMapImageFilter(
    props: DisplacementMapImageFilterProps
  ): ImageFilterNode<DisplacementMapImageFilterProps>;
  RuntimeShaderImageFilter(
    props: RuntimeShaderImageFilterProps
  ): ImageFilterNode<RuntimeShaderImageFilterProps>;

  // ColorFilters
  MatrixColorFilter(
    props: MatrixColorFilterProps
  ): DeclarationNode<MatrixColorFilterProps>;
  BlendColorFilter(
    props: BlendColorFilterProps
  ): DeclarationNode<BlendColorFilterProps>;
  LumaColorFilter(): DeclarationNode<null>;
  LinearToSRGBGammaColorFilter(): DeclarationNode<null>;
  SRGBToLinearGammaColorFilter(): DeclarationNode<null>;
  LerpColorFilter(
    props: LerpColorFilterProps
  ): DeclarationNode<LerpColorFilterProps>;

  // Shaders
  Shader(props: ShaderProps): DeclarationNode<ShaderProps>;
  ImageShader(props: ImageShaderProps): DeclarationNode<ImageShaderProps>;
  ColorShader(props: ColorProps): DeclarationNode<ColorProps>;
  Turbulence(props: TurbulenceProps): DeclarationNode<TurbulenceProps>;
  FractalNoise(props: FractalNoiseProps): DeclarationNode<FractalNoiseProps>;
  LinearGradient(
    props: LinearGradientProps
  ): DeclarationNode<LinearGradientProps>;
  RadialGradient(
    props: RadialGradientProps
  ): DeclarationNode<RadialGradientProps>;
  SweepGradient(props: SweepGradientProps): DeclarationNode<SweepGradientProps>;
  TwoPointConicalGradient(
    props: TwoPointConicalGradientProps
  ): DeclarationNode<TwoPointConicalGradientProps>;

  // Path Effects
  CornerPathEffect(
    props: CornerPathEffectProps
  ): NullablePathEffectNode<CornerPathEffectProps>;
  DiscretePathEffect(
    props: DiscretePathEffectProps
  ): PathEffectNode<DiscretePathEffectProps>;
  DashPathEffect(
    props: DashPathEffectProps
  ): PathEffectNode<DashPathEffectProps>;
  Path1DPathEffect(
    props: Path1DPathEffectProps
  ): NullablePathEffectNode<Path1DPathEffectProps>;
  Path2DPathEffect(
    props: Path2DPathEffectProps
  ): NullablePathEffectNode<Path2DPathEffectProps>;
  SumPathEffect(): NullablePathEffectNode<null>;
  Line2DPathEffect(
    props: Line2DPathEffectProps
  ): NullablePathEffectNode<Line2DPathEffectProps>;

  // Mixed
  Blend(props: BlendProps): DeclarationNode<BlendProps>;
  BackdropFilter(props: ChildrenProps): RenderNode<ChildrenProps>;
  Box(props: BoxProps): RenderNode<BoxProps>;
  BoxShadow(props: BoxShadowProps): DeclarationNode<BoxShadowProps>;
}
