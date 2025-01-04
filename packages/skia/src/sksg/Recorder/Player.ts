"worklet";

import { drawImage } from "../nodes/drawings";

import {
  composeColorFilters,
  isPushColorFilter,
  pushColorFilter,
  setColorFilters,
} from "./commands/ColorFilters";
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
  if (isCommand(command, CommandType.SavePaint)) {
    ctx.savePaint();
  } else if (isCommand(command, CommandType.RestorePaint)) {
    ctx.restorePaint();
  } else if (isCommand(command, CommandType.ComposeColorFilter)) {
    composeColorFilters(ctx);
  } else if (isCommand(command, CommandType.MaterializePaint)) {
    setColorFilters(ctx);
  } else if (isPushColorFilter(command)) {
    pushColorFilter(ctx, command);
  } else if (isDrawCommand(command, CommandType.DrawImage)) {
    drawImage(ctx, command.props);
  } else {
    console.warn(`Unknown command: ${command.type}`);
  }
};

export const replay = (ctx: DrawingContext, commands: Command[]) => {
  commands.forEach((command) => {
    play(ctx, command);
  });
};
