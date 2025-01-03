import type { SharedValue } from "react-native-reanimated";

import { NodeType } from "../../dom/types";
import type { BoxShadowProps, BoxProps, CTMProps } from "../../dom/types";
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
  PushColorFilter,
  PopColorFilter,
}

type AnimatedProps<T> = {
  [P in keyof T]: SharedValue<T[P]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Command<T extends CommandType = CommandType, Props = any> {
  type: T;
  props: Props;
  animatedProps?: Partial<AnimatedProps<Props>>;
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

  draw<T extends CommandType>(type: T, drawProps: object) {
    const { props, animatedProps } = splitProps(drawProps);
    this.commands.push({ type, props, animatedProps });
  }
}
