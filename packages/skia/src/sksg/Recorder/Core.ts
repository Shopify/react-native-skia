import type { SharedValue } from "react-native-reanimated";

import type {
  BlurMaskFilterProps,
  CircleProps,
  CTMProps,
  ImageProps,
  PaintProps,
  PointsProps,
  PathProps,
  RectProps,
  RoundedRectProps,
  OvalProps,
  LineProps,
  PatchProps,
  VerticesProps,
  DiffRectProps,
  TextProps,
  TextPathProps,
  TextBlobProps,
  GlyphsProps,
  PictureProps,
  ImageSVGProps,
  ParagraphProps,
  AtlasProps,
} from "../../dom/types";

// TODO: remove string labels
export enum CommandType {
  // Context
  SavePaint = "SavePaint",
  RestorePaint = "RestorePaint",
  SaveCTM = "SaveCTM",
  RestoreCTM = "RestoreCTM",
  PushColorFilter = "PushColorFilter",
  PushBlurMaskFilter = "PushBlurMaskFilter",
  PushImageFilter = "PushImageFilter",
  PushShader = "PushShader",
  ComposeColorFilter = "ComposeColorFilter",
  ComposeImageFilter = "ComposeImageFilter",
  MaterializePaint = "MaterializePaint",
  SaveBackdropFilter = "SaveBackdropFilter",
  // Drawing
  DrawImage = "DrawImage",
  DrawCircle = "DrawCircle",
  DrawPaint = "DrawPaint",
  DrawPoints = "DrawPoints",
  DrawPath = "DrawPath",
  DrawRect = "DrawRect",
  DrawRRect = "DrawRRect",
  DrawOval = "DrawOval",
  DrawLine = "DrawLine",
  DrawPatch = "DrawPatch",
  DrawVertices = "DrawVertices",
  DrawDiffRect = "DrawDiffRect",
  DrawText = "DrawText",
  DrawTextPath = "DrawTextPath",
  DrawTextBlob = "DrawTextBlob",
  DrawGlyphs = "DrawGlyphs",
  DrawPicture = "DrawPicture",
  DrawImageSVG = "DrawImageSVG",
  DrawParagraph = "DrawParagraph",
  DrawAtlas = "DrawAtlas",
}

export type Command<T extends CommandType = CommandType> = {
  type: T;
  [key: string]: unknown;
};

export const materializeProps = (command: Command) => {
  if (command.animatedProps) {
    const animatedProps = command.animatedProps as Record<
      string,
      SharedValue<unknown>
    >;
    const commandProps = command.props as Record<string, unknown>;
    for (const key in animatedProps) {
      commandProps[key] = animatedProps[key].value;
    }
  }
};

export const isCommand = <T extends CommandType>(
  command: Command,
  type: T
): command is Command<T> => {
  return command.type === type;
};

interface Props {
  [CommandType.DrawImage]: ImageProps;
  [CommandType.DrawCircle]: CircleProps;
  [CommandType.SaveCTM]: CTMProps;
  [CommandType.SavePaint]: PaintProps;
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

export const isDrawCommand = <T extends keyof Props>(
  command: Command,
  type: T
): command is DrawCommand<T> => {
  return command.type === type;
};
