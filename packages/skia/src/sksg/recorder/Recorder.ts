import type { SharedValue } from "react-native-reanimated";

import type {
  AtlasProps,
  CircleProps,
  CTMProps,
  DiffRectProps,
  GlyphsProps,
  ImageProps,
  ImageSVGProps,
  LineProps,
  OvalProps,
  ParagraphProps,
  PatchProps,
  PathProps,
  PictureProps,
  PointsProps,
  RectProps,
  RoundedRectProps,
  TextPathProps,
  TextProps,
  VerticesProps,
} from "../../dom/types";
import { splitProps } from "../nodes";

import type { PaintProps } from "./Paint";

export enum CommandType {
  PushPaint,
  PopPaint,
  PushCTM,
  PopCTM,
  DrawPaint,
  DrawGlyphs,
  DrawCircle,
  DrawImage,
  DrawPicture,
  DrawImageSVG,
  DrawParagraph,
  DrawAtlas,
  DrawPoints,
  DrawPath,
  DrawRect,
  DrawRRect,
  DrawOval,
  DrawLine,
  DrawPatch,
  DrawVertices,
  DrawDiffRect,
  DrawText,
  DrawTextPath,
  DrawTextBlob,
}

type CommandProps = {
  [CommandType.PushPaint]: PaintProps;
  [CommandType.PopPaint]: null;
  [CommandType.PushCTM]: CTMProps;
  [CommandType.PopCTM]: null;
  [CommandType.DrawPaint]: null;
  [CommandType.DrawGlyphs]: GlyphsProps;
  [CommandType.DrawCircle]: CircleProps;
  [CommandType.DrawImage]: ImageProps;
  [CommandType.DrawPicture]: PictureProps;
  [CommandType.DrawImageSVG]: ImageSVGProps;
  [CommandType.DrawParagraph]: ParagraphProps;
  [CommandType.DrawAtlas]: AtlasProps;
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
  [CommandType.DrawTextBlob]: TextProps;
};

type AnimatedProps<T> = {
  [P in keyof T]: SharedValue<T[P]>;
};

export interface Command<T extends CommandType = CommandType> {
  type: T;
  props: CommandProps[T];
  animatedProps?: Partial<AnimatedProps<CommandProps[T]>>;
}

export class Recorder {
  public commands: Command[] = [];

  pushPaint(props: PaintProps) {
    this.commands.push({ type: CommandType.PushPaint, props });
  }

  popPaint() {
    this.commands.push({ type: CommandType.PopPaint, props: null });
  }

  pushCTM(ctmProps: CTMProps) {
    const { props, animatedProps } = splitProps(ctmProps);
    this.commands.push({ type: CommandType.PushCTM, props, animatedProps });
  }

  popCTM() {
    this.commands.push({ type: CommandType.PopCTM, props: null });
  }

  draw<T extends CommandType>(type: T, drawProps: CommandProps[T]) {
    const { props, animatedProps } = splitProps(drawProps);
    this.commands.push({ type, props, animatedProps });
  }
}
