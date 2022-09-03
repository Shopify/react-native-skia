import { NodeType } from "../dom/types";
import type {
  CircleProps,
  DrawingNodeProps,
  ImageProps,
  PaintProps,
  PathProps,
  CustomDrawingNodeProps,
  LineProps,
  OvalProps,
  DiffRectProps,
  PointsProps,
  RectProps,
  RoundedRectProps,
  TextProps,
  VerticesProps,
  BlurMaskFilterProps,
  BlendImageFilterProps,
  BlurImageFilterProps,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
  MatrixColorFilterProps,
  ShaderProps,
  ImageShaderProps,
  LinearGradientProps,
  GroupProps,
  PatchProps,
} from "../dom/types";

import type { Container } from "./Container";
import { exhaustiveCheck } from "./typeddash";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      skGroup: GroupProps;
      skPaint: PaintProps;

      // Drawings
      skFill: DrawingNodeProps;
      skImage: ImageProps;
      skCircle: CircleProps;
      skPath: PathProps;
      // TODO: rename to CustomDrawingProps
      skDrawing: CustomDrawingNodeProps;
      skLine: LineProps;
      skOval: OvalProps;
      skPatch: PatchProps;
      skPoints: PointsProps;
      skRect: RectProps;
      skRRect: RoundedRectProps;
      skVertices: VerticesProps;
      skText: TextProps;
      skDiffRect: DiffRectProps;

      // BlurMaskFilters
      skBlurMaskFilter: BlurMaskFilterProps;

      // ImageFilters
      skBlendImageFilter: BlendImageFilterProps;
      skBlurImageFilter: BlurImageFilterProps;
      skOffsetImageFilter: OffsetImageFilterProps;
      skDropShadowImageFilter: DropShadowImageFilterProps;
      skDisplacementMap: DisplacementMapImageFilterProps;
      skRuntimeShaderImageFilter: RuntimeShaderImageFilterProps;

      // ColorFilters
      skMatrixColorFilter: MatrixColorFilterProps;

      // Shaders
      skShader: ShaderProps;
      ImageShader: ImageShaderProps;
      LinearGradient: LinearGradientProps;
    }
  }
}

export const createNode = (
  container: Container,
  type: NodeType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any
) => {
  const { Sk } = container;
  switch (type) {
    case NodeType.Group:
      return Sk.Group(props);
    case NodeType.Paint:
      return Sk.Paint(props);
    // Drawings
    case NodeType.Fill:
      return Sk.Fill(props);
    case NodeType.Image:
      return Sk.Image(props);
    case NodeType.Circle:
      return Sk.Circle(props);
    case NodeType.Path:
      return Sk.Path(props);
    case NodeType.Drawing:
      return Sk.CustomDrawing(props);
    case NodeType.Line:
      return Sk.Line(props);
    case NodeType.Oval:
      return Sk.Oval(props);
    case NodeType.Patch:
      return Sk.Patch(props);
    case NodeType.Points:
      return Sk.Points(props);
    case NodeType.Rect:
      return Sk.Rect(props);
    case NodeType.RRect:
      return Sk.RRect(props);
    case NodeType.Vertices:
      return Sk.Vertices(props);
    case NodeType.Text:
      return Sk.Text(props);
    case NodeType.DiffRect:
      return Sk.DiffRect(props);
    // Mask Filter
    case NodeType.BlurMaskFilter:
      return Sk.BlurMaskFilter(props);
    // Image Filter
    case NodeType.BlendImageFilter:
      return Sk.BlendImageFilter(props);
    case NodeType.BlurImageFilter:
      return Sk.BlurImageFilter(props);
    case NodeType.OffsetImageFilter:
      return Sk.OffsetImageFilter(props);
    case NodeType.DropShadowImageFilter:
      return Sk.DropShadowImageFilter(props);
    case NodeType.DisplacementMapImageFilter:
      return Sk.DisplacementMapImageFilter(props);
    case NodeType.MorphologyImageFilter:
      return Sk.MorphologyImageFilter(props);
    case NodeType.RuntimeShaderImageFilter:
      return Sk.RuntimeShaderImageFilter(props);
    // Color Filter
    case NodeType.MatrixColorFilter:
      return Sk.MatrixColorFilter(props);
    case NodeType.BlendColorFilter:
      return Sk.BlendColorFilter(props);
    case NodeType.LumaColorFilter:
      return Sk.LumaColorFilter();
    case NodeType.LinearToSRGBGammaColorFilter:
      return Sk.LinearToSRGBGammaColorFilter();
    case NodeType.SRGBToLinearGammaColorFilter:
      return Sk.SRGBToLinearGammaColorFilter();
    // Shader
    case NodeType.Shader:
      return Sk.Shader(props);
    case NodeType.ImageShader:
      return Sk.ImageShader(props);
    case NodeType.LinearGradient:
      return Sk.LinearGradient(props);
    // Path Effect
    case NodeType.CornerPathEffect:
      return Sk.CornerPathEffect(props);
    case NodeType.DiscretePathEffect:
      return Sk.DiscretePathEffect(props);
    case NodeType.DashPathEffect:
      return Sk.DashPathEffect(props);
    case NodeType.Path1DPathEffect:
      return Sk.Path1DPathEffect(props);
    case NodeType.Path2DPathEffect:
      return Sk.Path2DPathEffect(props);
    case NodeType.SumPathEffect:
      return Sk.SumPathEffect();
    case NodeType.Line2DPathEffect:
      return Sk.Line2DPathEffect(props);
    default:
      return exhaustiveCheck(type);
  }
};
