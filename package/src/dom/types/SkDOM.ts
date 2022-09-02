import type { SkImageFilter, SkShader } from "../../skia/types";
import type { SkColorFilter } from "../../skia/types/ColorFilter/ColorFilter";

import type { GroupProps } from "./Common";
import type { BlurImageFilterProps } from "./ImageFilters";
import type {
  DrawingNodeProps,
  GroupNode,
  DrawingNode,
  NestedDeclarationNode,
} from "./Node";
import type { MatrixColorFilterProps } from "./ColorFilters";
import type { ImageProps, CircleProps } from "./Drawings";

export interface SkDOM {
  Group(props?: GroupProps): GroupNode<GroupProps>;
  // Drawings
  Fill(props?: DrawingNodeProps): DrawingNode<DrawingNodeProps>;
  Image(props: ImageProps): DrawingNode<ImageProps>;
  Circle(props: CircleProps): DrawingNode<CircleProps>;
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
}
