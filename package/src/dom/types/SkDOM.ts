import type { SkImageFilter, SkMaskFilter, SkShader } from "../../skia/types";
import type { SkColorFilter } from "../../skia/types/ColorFilter/ColorFilter";
import type { SkPathEffect } from "../../skia/types/PathEffect";

import type { GroupProps, PaintProps } from "./Common";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  DropShadowImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
  DisplacementMapImageFilterProps,
  MorphologyImageFilterProps,
} from "./ImageFilters";
import type {
  DrawingNodeProps,
  GroupNode,
  DrawingNode,
  NestedDeclarationNode,
  DeclarationNode,
  PaintNode,
} from "./Node";
import type {
  BlendColorFilterProps,
  MatrixColorFilterProps,
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
} from "./Drawings";
import type { BlurMaskFilterProps } from "./MaskFilters";
import type {
  ImageShaderProps,
  LinearGradientProps,
  ShaderProps,
} from "./Shaders";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "./PathEffects";

type ImageFilterNode<P> = NestedDeclarationNode<
  P,
  SkImageFilter,
  SkImageFilter | SkColorFilter | SkShader
>;

type PathEffectNode<P> = NestedDeclarationNode<P, SkPathEffect>;
type NullablePathEffectNode<P> = NestedDeclarationNode<
  P,
  SkPathEffect,
  SkPathEffect,
  null
>;

export interface SkDOM {
  Group(props?: GroupProps): GroupNode;
  Paint(props: PaintProps): PaintNode;

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
  DiffRect(props: DiffRectProps): DrawingNode<DiffRectProps>;

  // BlurMaskFilters
  BlurMaskFilter(
    props: BlurMaskFilterProps
  ): DeclarationNode<BlurMaskFilterProps, SkMaskFilter>;

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
  ): NestedDeclarationNode<MatrixColorFilterProps, SkColorFilter>;
  BlendColorFilter(
    props: BlendColorFilterProps
  ): NestedDeclarationNode<BlendColorFilterProps, SkColorFilter>;
  LumaColorFilter(): NestedDeclarationNode<null, SkColorFilter>;
  LinearToSRGBGammaColorFilter(): NestedDeclarationNode<null, SkColorFilter>;
  SRGBToLinearGammaColorFilter(): NestedDeclarationNode<null, SkColorFilter>;

  // Shaders
  Shader(props: ShaderProps): NestedDeclarationNode<ShaderProps, SkShader>;
  ImageShader(
    props: ImageShaderProps
  ): DeclarationNode<ImageShaderProps, SkShader>;
  LinearGradient(
    props: LinearGradientProps
  ): DeclarationNode<LinearGradientProps, SkShader>;

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
}
