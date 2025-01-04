"worklet";

import {
  drawCircle,
  drawImage,
  drawOval,
  drawPath,
  drawPoints,
  drawRect,
  drawRRect,
  drawLine,
  drawAtlas,
  drawParagraph,
  drawImageSVG,
  drawPicture,
  drawGlyphs,
  drawTextBlob,
  drawTextPath,
  drawText,
  drawDiffRect,
  drawVertices,
  drawPatch,
} from "../nodes/drawings";

import {
  composeColorFilters,
  isPushColorFilter,
  pushColorFilter,
  setColorFilters,
} from "./commands/ColorFilters";
import { saveCTM } from "./commands/CTM";
import { setBlurMaskFilter } from "./commands/ImageFilters";
import { setPaintProperties } from "./commands/Paint";
import { isPushShader, pushShader, setShaders } from "./commands/Shaders";
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
    setShaders(ctx);
  } else if (isPushColorFilter(command)) {
    pushColorFilter(ctx, command);
  } else if (isPushShader(command)) {
    pushShader(ctx, command);
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
  } else if (isDrawCommand(command, CommandType.DrawPoints)) {
    drawPoints(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawPath)) {
    drawPath(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawRect)) {
    drawRect(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawRRect)) {
    drawRRect(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawOval)) {
    drawOval(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawLine)) {
    drawLine(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawPatch)) {
    drawPatch(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawVertices)) {
    drawVertices(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawDiffRect)) {
    drawDiffRect(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawText)) {
    drawText(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawTextPath)) {
    drawTextPath(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawTextBlob)) {
    drawTextBlob(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawGlyphs)) {
    drawGlyphs(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawPicture)) {
    drawPicture(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawImageSVG)) {
    drawImageSVG(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawParagraph)) {
    drawParagraph(ctx, command.props);
  } else if (isDrawCommand(command, CommandType.DrawAtlas)) {
    drawAtlas(ctx, command.props);
  } else {
    console.warn(`Unknown command: ${command.type}`);
  }
};

export const replay = (ctx: DrawingContext, commands: Command[]) => {
  commands.forEach((command) => {
    play(ctx, command);
  });
};
