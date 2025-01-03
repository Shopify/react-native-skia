import type { SharedValue } from "react-native-reanimated";

import { NodeType } from "../../dom/types";
import type {
  BoxShadowProps,
  AtlasProps,
  BoxProps,
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
import type { Node } from "../nodes";
import { splitProps } from "../nodes";
import type { SkPaint } from "../../skia";

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
  DrawBox,
  BackdropFilter,
  PushLayer,
  PopLayer,
  PushStaticPaint,
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
  [CommandType.BackdropFilter]: Node;
  [CommandType.PushLayer]: Node[];
  [CommandType.PopLayer]: null;
  [CommandType.PushStaticPaint]: SkPaint;
  [CommandType.DrawBox]: { props: BoxProps; children: Node[] };
};

type AnimatedProps<T> = {
  [P in keyof T]: SharedValue<T[P]>;
};

export interface Command<T extends CommandType = CommandType> {
  type: T;
  props: CommandProps[T];
  animatedProps?: Partial<AnimatedProps<CommandProps[T]>>;
}

export interface DrawBoxCommand extends Command<CommandType.DrawBox> {
  shadows: BoxShadowProps[];
}

export class Recorder {
  public commands: Command[] = [];

  pushPaint(props: PaintProps) {
    this.commands.push({ type: CommandType.PushPaint, props });
  }

  pushStaticPaint(props: SkPaint) {
    this.commands.push({ type: CommandType.PushStaticPaint, props });
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

  pushLayer(props: Node) {
    this.commands.push({ type: CommandType.PushLayer, props });
  }

  popLayer() {
    this.commands.push({ type: CommandType.PopLayer, props: null });
  }

  drawBox(props: BoxProps, children: Node[]) {
    this.commands.push({
      type: CommandType.DrawBox,
      props,
      shadows: children
        .filter((child) => child.type === NodeType.BoxShadow)
        .map((child) => child.props)
        .map((p) => splitProps(p)),
    } as Command);
  }

  draw<T extends CommandType>(type: T, drawProps: CommandProps[T]) {
    const { props, animatedProps } = splitProps(drawProps);
    this.commands.push({ type, props, animatedProps });
  }
}
