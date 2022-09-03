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
import type { MatrixColorFilterProps } from "./ColorFilters";
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
} from "./Drawings";
import type { BlurMaskFilterProps } from "./MaskFilters";
import type {
  ImageShaderProps,
  LinearGradientProps,
  ShaderProps,
} from "./Shaders";
import type { CornerPathEffectProps } from "./PathEffects";

type ImageFilterNode = NestedDeclarationNode<
  unknown,
  SkImageFilter,
  SkImageFilter | SkColorFilter | SkShader
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
  DiffRect(props: DiffRectProps): DrawingNode<DiffRectProps>;

  // BlurMaskFilters
  BlurMaskFilter(
    props: BlurMaskFilterProps
  ): DeclarationNode<BlurMaskFilterProps, SkMaskFilter>;

  // ImageFilters
  BlendImageFilter(props: BlendImageFilterProps): ImageFilterNode;
  BlurImageFilter(props: BlurImageFilterProps): ImageFilterNode;
  OffsetImageFilter(props: OffsetImageFilterProps): ImageFilterNode;
  DropShadowImageFilter(props: DropShadowImageFilterProps): ImageFilterNode;
  MorphologyImageFilter(props: MorphologyImageFilterProps): ImageFilterNode;
  DisplacementMapImageFilter(
    props: DisplacementMapImageFilterProps
  ): ImageFilterNode;
  RuntimeShaderImageFilter(
    props: RuntimeShaderImageFilterProps
  ): ImageFilterNode;

  // ColorFilters
  MatrixColorFilter(
    props: MatrixColorFilterProps
  ): NestedDeclarationNode<MatrixColorFilterProps, SkColorFilter>;

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
  ): DeclarationNode<CornerPathEffectProps, SkPathEffect, null>;
}
