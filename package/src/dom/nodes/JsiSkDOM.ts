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
} from "../types";
import type { DrawingNodeProps } from "../types/Node";

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
} from "./drawings";
import { GroupNode } from "./GroupNode";
import { BlurImageFilterNode, BlurMaskFilterNode, PaintNode } from "./paint";
import { MatrixColorFilterNode } from "./paint/ColorFilters";
import {
  LinearGradientNode,
  ShaderNode,
  ImageShaderNode,
} from "./paint/Shaders";
import { DiffRectNode } from "./drawings/DiffRectNode";

export class JsiSkDOM implements SkDOM {
  constructor(private Skia: Skia) {}

  Group(props?: GroupProps) {
    return new GroupNode(this.Skia, props);
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

  DiffRect(props: DiffRectProps) {
    return new DiffRectNode(this.Skia, props);
  }

  // BlurMaskFilters
  BlurMaskFilter(props: BlurMaskFilterProps) {
    return new BlurMaskFilterNode(this.Skia, props);
  }

  // ImageFilters
  BlurImageFilter(props: BlurImageFilterProps) {
    return new BlurImageFilterNode(this.Skia, props);
  }

  // Color Filters
  MatrixColorFilter(props: MatrixColorFilterProps) {
    return new MatrixColorFilterNode(this.Skia, props);
  }

  // Shaders
  Shader(props: ShaderProps) {
    return new ShaderNode(this.Skia, props);
  }

  ImageShader(props: ImageShaderProps) {
    return new ImageShaderNode(this.Skia, props);
  }

  LinearGradient(props: LinearGradientProps) {
    return new LinearGradientNode(this.Skia, props);
  }
}
