import type { SharedValue } from "react-native-reanimated";
import type { TextProps, AtlasProps, BlurMaskFilterProps, BoxProps, BoxShadowProps, CircleProps, CTMProps, DiffRectProps, GlyphsProps, ImageProps, ImageSVGProps, LineProps, NodeType, OvalProps, PaintProps, ParagraphProps, PatchProps, PathProps, PictureProps, PointsProps, RectProps, RoundedRectProps, TextBlobProps, TextPathProps, VerticesProps } from "../../dom/types";
import type { AnimatedProps } from "../../renderer/processors/Animations/Animations";
import type { SkPicture } from "./Picture";
export interface BaseRecorder {
    saveGroup(): void;
    restoreGroup(): void;
    savePaint(props: AnimatedProps<PaintProps>): void;
    restorePaint(): void;
    restorePaintDeclaration(): void;
    materializePaint(): void;
    pushPathEffect(pathEffectType: NodeType, props: AnimatedProps<unknown>): void;
    pushImageFilter(imageFilterType: NodeType, props: AnimatedProps<unknown>): void;
    pushColorFilter(colorFilterType: NodeType, props: AnimatedProps<unknown>): void;
    pushShader(shaderType: NodeType, props: AnimatedProps<unknown>): void;
    pushBlurMaskFilter(props: AnimatedProps<BlurMaskFilterProps>): void;
    composePathEffect(): void;
    composeColorFilter(): void;
    composeImageFilter(): void;
    saveCTM(props: AnimatedProps<CTMProps>): void;
    restoreCTM(): void;
    drawPaint(): void;
    saveLayer(): void;
    saveBackdropFilter(): void;
    drawBox(boxProps: AnimatedProps<BoxProps>, shadows: {
        props: BoxShadowProps;
        animatedProps?: Record<string, SharedValue<unknown>>;
    }[]): void;
    drawImage(props: AnimatedProps<ImageProps>): void;
    drawCircle(props: AnimatedProps<CircleProps>): void;
    drawPoints(props: AnimatedProps<PointsProps>): void;
    drawPath(props: AnimatedProps<PathProps>): void;
    drawRect(props: AnimatedProps<RectProps>): void;
    drawRRect(props: AnimatedProps<RoundedRectProps>): void;
    drawOval(props: AnimatedProps<OvalProps>): void;
    drawLine(props: AnimatedProps<LineProps>): void;
    drawPatch(props: AnimatedProps<PatchProps>): void;
    drawVertices(props: AnimatedProps<VerticesProps>): void;
    drawDiffRect(props: AnimatedProps<DiffRectProps>): void;
    drawText(props: AnimatedProps<TextProps>): void;
    drawTextPath(props: AnimatedProps<TextPathProps>): void;
    drawTextBlob(props: AnimatedProps<TextBlobProps>): void;
    drawGlyphs(props: AnimatedProps<GlyphsProps>): void;
    drawPicture(props: AnimatedProps<PictureProps>): void;
    drawImageSVG(props: AnimatedProps<ImageSVGProps>): void;
    drawParagraph(props: AnimatedProps<ParagraphProps>): void;
    drawAtlas(props: AnimatedProps<AtlasProps>): void;
}
export interface JsiRecorder extends BaseRecorder {
    play(): SkPicture;
    applyUpdates(variables: SharedValue<unknown>[]): void;
}
