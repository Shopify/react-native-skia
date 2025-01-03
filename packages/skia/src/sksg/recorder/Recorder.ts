"worklet";

import type { SharedValue } from "react-native-reanimated";

import type { CircleProps, CTMProps, GlyphsProps } from "../../dom/types";
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
}

type CommandProps = {
  [CommandType.PushPaint]: PaintProps;
  [CommandType.PopPaint]: null;
  [CommandType.PushCTM]: CTMProps;
  [CommandType.PopCTM]: null;
  [CommandType.DrawPaint]: null;
  [CommandType.DrawGlyphs]: GlyphsProps;
  [CommandType.DrawCircle]: CircleProps;
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

  drawPaint() {
    this.commands.push({ type: CommandType.DrawPaint, props: null });
  }

  drawGlyphs(glyphsProps: GlyphsProps) {
    const { props, animatedProps } = splitProps(glyphsProps);
    this.commands.push({ type: CommandType.DrawGlyphs, props, animatedProps });
  }

  drawCircle(circleProps: CircleProps) {
    const { props, animatedProps } = splitProps(circleProps);
    this.commands.push({ type: CommandType.DrawCircle, props, animatedProps });
  }
}
