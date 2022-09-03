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
