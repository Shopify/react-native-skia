import type { BlurMaskFilterProps, CircleProps, CTMProps, ImageProps, PointsProps, PathProps, RectProps, RoundedRectProps, OvalProps, LineProps, PatchProps, VerticesProps, DiffRectProps, TextProps, TextPathProps, TextBlobProps, GlyphsProps, PictureProps, ImageSVGProps, ParagraphProps, AtlasProps, DrawingNodeProps } from "../../dom/types";
export declare enum CommandType {
    Group = 0,
    SavePaint = 1,
    RestorePaint = 2,
    SaveCTM = 3,
    RestoreCTM = 4,
    PushColorFilter = 5,
    PushBlurMaskFilter = 6,
    PushImageFilter = 7,
    PushPathEffect = 8,
    PushShader = 9,
    ComposeColorFilter = 10,
    ComposeImageFilter = 11,
    ComposePathEffect = 12,
    MaterializePaint = 13,
    SaveBackdropFilter = 14,
    SaveLayer = 15,
    RestorePaintDeclaration = 16,
    DrawBox = 17,
    DrawImage = 18,
    DrawCircle = 19,
    DrawPaint = 20,
    DrawPoints = 21,
    DrawPath = 22,
    DrawRect = 23,
    DrawRRect = 24,
    DrawOval = 25,
    DrawLine = 26,
    DrawPatch = 27,
    DrawVertices = 28,
    DrawDiffRect = 29,
    DrawText = 30,
    DrawTextPath = 31,
    DrawTextBlob = 32,
    DrawGlyphs = 33,
    DrawPicture = 34,
    DrawImageSVG = 35,
    DrawParagraph = 36,
    DrawAtlas = 37
}
export type Command<T extends CommandType = CommandType> = {
    type: T;
    [key: string]: unknown;
};
export declare const materializeCommand: (command: any) => any;
export declare const isCommand: <T extends CommandType>(command: Command, type: T) => command is Command<T>;
interface GroupCommand extends Command<CommandType.Group> {
    children: Command[];
}
export declare const isGroup: (command: Command) => command is GroupCommand;
interface Props {
    [CommandType.DrawImage]: ImageProps;
    [CommandType.DrawCircle]: CircleProps;
    [CommandType.SaveCTM]: CTMProps;
    [CommandType.SavePaint]: DrawingNodeProps;
    [CommandType.PushBlurMaskFilter]: BlurMaskFilterProps;
    [CommandType.DrawPoints]: PointsProps;
    [CommandType.DrawPath]: PathProps;
    [CommandType.DrawRect]: RectProps;
    [CommandType.DrawRRect]: RoundedRectProps;
    [CommandType.DrawOval]: OvalProps;
    [CommandType.DrawLine]: LineProps;
    [CommandType.DrawPatch]: PatchProps;
    [CommandType.DrawVertices]: VerticesProps;
    [CommandType.DrawDiffRect]: DiffRectProps;
    [CommandType.DrawText]: TextProps;
    [CommandType.DrawTextPath]: TextPathProps;
    [CommandType.DrawTextBlob]: TextBlobProps;
    [CommandType.DrawGlyphs]: GlyphsProps;
    [CommandType.DrawPicture]: PictureProps;
    [CommandType.DrawImageSVG]: ImageSVGProps;
    [CommandType.DrawParagraph]: ParagraphProps;
    [CommandType.DrawAtlas]: AtlasProps;
}
interface DrawCommand<T extends CommandType> extends Command<T> {
    props: T extends keyof Props ? Props[T] : never;
}
export declare const isDrawCommand: <T extends keyof Props>(command: Command, type: T) => command is DrawCommand<T>;
export {};
