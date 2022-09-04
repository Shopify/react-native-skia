export enum NodeType {
  Group = "skGroup",

  Shader = "skShader",
  ImageShader = "skImageShader",
  ColorShader = "skColorShader",
  Turbulence = "skTurbulence",
  FractalNoise = "skFractalNoise",
  LinearGradient = "skLinearGradient",
  RadialGradient = "skRadialGradient",
  SweepGradient = "skSweepGradient",
  TwoPointConicalGradient = "skTwoPointConicalGradient",

  BlurMaskFilter = "skBlurMaskFilter",

  DiscretePathEffect = "skDiscretePathEffect",
  DashPathEffect = "skDashPathEffect",
  Path1DPathEffect = "skPath1DPathEffect",
  Path2DPathEffect = "skPath2DPathEffect",
  CornerPathEffect = "skCornerPathEffect",
  SumPathEffect = "skSumPathEffect",
  Line2DPathEffect = "skLine2DPathEffect",

  MatrixColorFilter = "skMatrixColorFilter",
  BlendColorFilter = "skBlendColorFilter",
  LinearToSRGBGammaColorFilter = "skLinearToSRGBGammaColorFilter",
  SRGBToLinearGammaColorFilter = "skSRGBToLinearGammaColorFilter",
  LumaColorFilter = "skLumaColorFilter",

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
  DiffRect = "skDiffRect",
  Text = "skText",
  TextPath = "skTextPath",
  TextBlob = "skTextBlob",
  Glyphs = "skGlyphs",
}

export enum DeclarationType {
  Shader,
  ImageFilter,
  ColorFilter,
  PathEffect,
  MaskFilter,
}

export enum NodeKind {
  Paint,
  Group,
  Declaration,
  NestedDeclaration,
  Drawing,
}
