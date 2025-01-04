"worklet";

import { drawCircle, drawImage } from "../nodes/drawings";

import {
  composeColorFilters,
  isPushColorFilter,
  pushColorFilter,
  setColorFilters,
} from "./commands/ColorFilters";
import { saveCTM } from "./commands/CTM";
import { setBlurMaskFilter } from "./commands/ImageFilters";
import { setPaintProperties } from "./commands/Paint";
import {
  CommandType,
  isCommand,
  isDrawCommand,
  materializeProps,
  type Command,
} from "./Core";
import type { DrawingContext } from "./DrawingContext";

const play = (ctx: DrawingContext, command: Command) => {
  materializeProps(command);
  if (isDrawCommand(command, CommandType.SavePaint)) {
    ctx.savePaint();
    setPaintProperties(ctx.Skia, ctx.paint, command.props);
  } else if (isCommand(command, CommandType.RestorePaint)) {
    ctx.restorePaint();
  } else if (isCommand(command, CommandType.ComposeColorFilter)) {
    composeColorFilters(ctx);
  } else if (isCommand(command, CommandType.MaterializePaint)) {
    setColorFilters(ctx);
  } else if (isPushColorFilter(command)) {
    pushColorFilter(ctx, command);
  } else if (isDrawCommand(command, CommandType.PushBlurMaskFilter)) {
    setBlurMaskFilter(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.SaveCTM)) {
    saveCTM(ctx, command.props);
  } else if (isCommand(command, CommandType.RestoreCTM)) {
    ctx.canvas.restore();
  } else if (isCommand(command, CommandType.DrawPaint)) {
    ctx.canvas.drawPaint(ctx.paint);
  } else if (isDrawCommand(command, CommandType.DrawImage)) {
    drawImage(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawCircle)) {
    drawCircle(ctx, command.props);
  } else {
    console.warn(`Unknown command: ${command.type}`);
  }
};

export const replay = (ctx: DrawingContext, commands: Command[]) => {
  commands.forEach((command) => {
    play(ctx, command);
  });
};
