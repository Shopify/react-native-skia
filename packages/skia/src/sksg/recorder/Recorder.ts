"worklet";

import type { SharedValue } from "react-native-reanimated";

import type { GlyphsProps } from "../../dom/types";
import { splitProps } from "../nodes";

import type { PaintProps } from "./Paint";

export enum CommandType {
  PushPaint,
  PopPaint,
  DrawPaint,
  DrawGlyphs,
}

type CommandProps = {
  [CommandType.PushPaint]: PaintProps;
  [CommandType.PopPaint]: null;
  [CommandType.DrawPaint]: null;
  [CommandType.DrawGlyphs]: GlyphsProps;
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

  drawPaint() {
    this.commands.push({ type: CommandType.DrawPaint, props: null });
  }

  drawGlyphs(glyphsProps: GlyphsProps) {
    const { props, animatedProps } = splitProps(glyphsProps);
    this.commands.push({ type: CommandType.DrawGlyphs, props, animatedProps });
  }
}
