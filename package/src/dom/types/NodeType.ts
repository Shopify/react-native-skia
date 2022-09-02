export enum NodeType {
  Group = "skGroup",

  Shader = "skShader",
  ImageShader = "skImageShader",
  LinearGradient = "skLinearGradient",

  BlurMaskFilter = "skBlurMaskFilter",

  DiscretePathEffect = "skDiscretePathEffect",
  DashPathEffect = "skDashPathEffect",
  Path1DPathEffect = "skPath1DPathEffect",
  Path2DPathEffect = "skPath2DPathEffect",
  CornerPathEffect = "skCornerPathEffect",
  ComposePathEffect = "skComposePathEffect",
  SumPathEffect = "skSumPathEffect",
  Line2DPathEffect = "skLine2DPathEffect",

  MatrixColorFilter = "skMatrixColorFilter",
  BlendColorFilter = "skBlendColorFilter",
  ComposeColorFilter = "skComposeColorFilter",
  LinearToSRGBGammaColorFilter = "skLinearToSRGBGammaColorFilter",
  SRGBToLinearGammaColorFilter = "skSRGBToLinearGammaColorFilter",
  LumaColorFilterColorFilter = "skLumaColorFilterColorFilter",

  OffsetImageFilter = "skOffsetImageFilter",
  DisplacementMapImageFilter = "skDisplacementMapImageFilter",
  BlurImageFilter = "skBlurImageFilter",
  DropShadowImageFilter = "skDropShadowImageFilter",
  MorphologyImageFilter = "skMorphologyImageFilter",
  BlendImageFilter = "skBlendImageFilter",
  RuntimeShaderImageFilter = "skRuntimeShaderImageFilter",

  Drawing = "skDrawing",
  Paint = "skPaint",
  Circle = "skCircle",
  Fill = "skFill",
  Image = "skImage",
  Points = "skPoints",
  Path = "skPath",
  Rect = "skRect",
  RRect = "skRRect",
  Oval = "skOval",
  Line = "skLine",
  Patch = "skPatch",
  Vertices = "skVertices",
}

export enum DeclarationType {
  Shader,
  ImageFilter,
  ColorFilter,
  PathEffect,
  MaskFilter,
}
