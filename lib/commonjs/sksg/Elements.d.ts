import type { FractalNoiseProps, CircleProps, DrawingNodeProps, ImageProps, PaintProps, PathProps, LineProps, OvalProps, DiffRectProps, PointsProps, RectProps, RoundedRectProps, TextProps, VerticesProps, BlurMaskFilterProps, BlendImageFilterProps, BlurImageFilterProps, DisplacementMapImageFilterProps, DropShadowImageFilterProps, OffsetImageFilterProps, RuntimeShaderImageFilterProps, MatrixColorFilterProps, ShaderProps, ImageShaderProps, LinearGradientProps, GroupProps, PatchProps, BlendColorFilterProps, DashPathEffectProps, DiscretePathEffectProps, CornerPathEffectProps, Line2DPathEffectProps, Path1DPathEffectProps, Path2DPathEffectProps, TextPathProps, TextBlobProps, GlyphsProps, TwoPointConicalGradientProps, TurbulenceProps, SweepGradientProps, RadialGradientProps, ColorProps, PictureProps, ImageSVGProps, LerpColorFilterProps, BoxProps, BoxShadowProps, ParagraphProps, AtlasProps, ChildrenProps, MorphologyImageFilterProps, BlendProps } from "../dom/types";
import type { SkiaProps } from "../renderer";
declare global {
    namespace JSX {
        interface IntrinsicElements {
            skGroup: SkiaProps<GroupProps>;
            skLayer: SkiaProps<ChildrenProps>;
            skPaint: SkiaProps<PaintProps>;
            skFill: SkiaProps<DrawingNodeProps>;
            skImage: SkiaProps<ImageProps>;
            skCircle: SkiaProps<CircleProps>;
            skPath: SkiaProps<PathProps>;
            skLine: SkiaProps<LineProps>;
            skOval: SkiaProps<OvalProps>;
            skPatch: SkiaProps<PatchProps>;
            skPoints: SkiaProps<PointsProps>;
            skRect: SkiaProps<RectProps>;
            skRRect: SkiaProps<RoundedRectProps>;
            skAtlas: SkiaProps<AtlasProps>;
            skVertices: SkiaProps<VerticesProps>;
            skText: SkiaProps<TextProps>;
            skTextPath: SkiaProps<TextPathProps>;
            skTextBlob: SkiaProps<TextBlobProps>;
            skGlyphs: SkiaProps<GlyphsProps>;
            skDiffRect: SkiaProps<DiffRectProps>;
            skPicture: SkiaProps<PictureProps>;
            skImageSVG: SkiaProps<ImageSVGProps>;
            skBlurMaskFilter: SkiaProps<BlurMaskFilterProps>;
            skBlendImageFilter: SkiaProps<BlendImageFilterProps>;
            skBlurImageFilter: SkiaProps<BlurImageFilterProps>;
            skOffsetImageFilter: SkiaProps<OffsetImageFilterProps>;
            skDropShadowImageFilter: SkiaProps<DropShadowImageFilterProps>;
            skDisplacementMapImageFilter: SkiaProps<DisplacementMapImageFilterProps>;
            skRuntimeShaderImageFilter: SkiaProps<RuntimeShaderImageFilterProps>;
            skMorphologyImageFilter: SkiaProps<MorphologyImageFilterProps>;
            skMatrixColorFilter: SkiaProps<MatrixColorFilterProps>;
            skBlendColorFilter: SkiaProps<BlendColorFilterProps>;
            skLinearToSRGBGammaColorFilter: SkiaProps<ChildrenProps>;
            skSRGBToLinearGammaColorFilter: SkiaProps<ChildrenProps>;
            skLumaColorFilter: SkiaProps<ChildrenProps>;
            skLerpColorFilter: SkiaProps<LerpColorFilterProps>;
            skShader: SkiaProps<ShaderProps>;
            skImageShader: SkiaProps<ImageShaderProps>;
            skColorShader: SkiaProps<ColorProps>;
            skTurbulence: SkiaProps<TurbulenceProps>;
            skFractalNoise: SkiaProps<FractalNoiseProps>;
            skLinearGradient: SkiaProps<LinearGradientProps>;
            skRadialGradient: SkiaProps<RadialGradientProps>;
            skSweepGradient: SkiaProps<SweepGradientProps>;
            skTwoPointConicalGradient: SkiaProps<TwoPointConicalGradientProps>;
            skDiscretePathEffect: SkiaProps<DiscretePathEffectProps>;
            skDashPathEffect: SkiaProps<DashPathEffectProps>;
            skPath1DPathEffect: SkiaProps<Path1DPathEffectProps>;
            skPath2DPathEffect: SkiaProps<Path2DPathEffectProps>;
            skCornerPathEffect: SkiaProps<CornerPathEffectProps>;
            skSumPathEffect: ChildrenProps;
            skLine2DPathEffect: SkiaProps<Line2DPathEffectProps>;
            skBlend: SkiaProps<BlendProps>;
            skBackdropFilter: SkiaProps<ChildrenProps>;
            skBox: SkiaProps<BoxProps>;
            skBoxShadow: SkiaProps<BoxShadowProps>;
            skParagraph: SkiaProps<ParagraphProps>;
        }
    }
}
