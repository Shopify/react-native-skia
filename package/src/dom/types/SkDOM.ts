import type { SkImageFilter, SkMaskFilter, SkShader } from "../../skia/types";
import type { SkColorFilter } from "../../skia/types/ColorFilter/ColorFilter";

import type { GroupProps, PaintProps } from "./Common";
import type { BlurImageFilterProps } from "./ImageFilters";
import type {
  DrawingNodeProps,
  GroupNode,
  DrawingNode,
  NestedDeclarationNode,
  DeclarationNode,
  PaintNode,
} from "./Node";
import type { MatrixColorFilterProps } from "./ColorFilters";
import type { ImageProps, CircleProps, PathProps } from "./Drawings";
import type { BlurMaskFilterProps } from "./MaskFilters";
import type {
  ImageShaderProps,
  LinearGradientProps,
  ShaderProps,
} from "./Shaders";

export interface SkDOM {
  Group(props?: GroupProps): GroupNode;
  Paint(props: PaintProps): PaintNode;

  // Drawings
  Fill(props?: DrawingNodeProps): DrawingNode<DrawingNodeProps>;
  Image(props: ImageProps): DrawingNode<ImageProps>;
  Circle(props: CircleProps): DrawingNode<CircleProps>;
  Path(props: PathProps): DrawingNode<PathProps>;

  // BlurMaskFilters
  BlurMaskFilter(
    props: BlurMaskFilterProps
  ): DeclarationNode<BlurMaskFilterProps, SkMaskFilter>;

  // ImageFilters
  BlurImageFilter(
    props: BlurImageFilterProps
  ): NestedDeclarationNode<
    BlurImageFilterProps,
    SkImageFilter,
    SkImageFilter | SkColorFilter | SkShader
  >;

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
}
