"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replay = void 0;
var _Drawing = require("./commands/Drawing");
var _Box = require("./commands/Box");
var _ColorFilters = require("./commands/ColorFilters");
var _CTM = require("./commands/CTM");
var _ImageFilters = require("./commands/ImageFilters");
var _Paint = require("./commands/Paint");
var _PathEffects = require("./commands/PathEffects");
var _Shaders = require("./commands/Shaders");
var _Core = require("./Core");
function play(ctx, _command) {
  "worklet";

  if ((0, _Core.isGroup)(_command)) {
    _command.children.forEach(child => play(ctx, child));
    return;
  }
  const command = (0, _Core.materializeCommand)(_command);
  if ((0, _Core.isCommand)(command, _Core.CommandType.SaveBackdropFilter)) {
    ctx.saveBackdropFilter();
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.SaveLayer)) {
    ctx.materializePaint();
    const paint = ctx.paintDeclarations.pop();
    ctx.canvas.saveLayer(paint);
  } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.SavePaint)) {
    if (command.props.paint) {
      ctx.paints.push(command.props.paint);
    } else {
      ctx.savePaint();
      (0, _Paint.setPaintProperties)(ctx.Skia, ctx.paint, command.props);
    }
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.RestorePaint)) {
    ctx.restorePaint();
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.ComposeColorFilter)) {
    (0, _ColorFilters.composeColorFilters)(ctx);
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.RestorePaintDeclaration)) {
    ctx.materializePaint();
    const paint = ctx.restorePaint();
    if (!paint) {
      throw new Error("No paint declaration to push");
    }
    ctx.paintDeclarations.push(paint);
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.MaterializePaint)) {
    ctx.materializePaint();
  } else if ((0, _ColorFilters.isPushColorFilter)(command)) {
    (0, _ColorFilters.pushColorFilter)(ctx, command);
  } else if ((0, _Shaders.isPushShader)(command)) {
    (0, _Shaders.pushShader)(ctx, command);
  } else if ((0, _ImageFilters.isPushImageFilter)(command)) {
    (0, _ImageFilters.pushImageFilter)(ctx, command);
  } else if ((0, _PathEffects.isPushPathEffect)(command)) {
    (0, _PathEffects.pushPathEffect)(ctx, command);
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.ComposePathEffect)) {
    (0, _PathEffects.composePathEffects)(ctx);
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.ComposeImageFilter)) {
    (0, _ImageFilters.composeImageFilters)(ctx);
  } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.PushBlurMaskFilter)) {
    (0, _ImageFilters.setBlurMaskFilter)(ctx, command.props);
  } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.SaveCTM)) {
    (0, _CTM.saveCTM)(ctx, command.props);
  } else if ((0, _Core.isCommand)(command, _Core.CommandType.RestoreCTM)) {
    ctx.canvas.restore();
  } else {
    const paints = [ctx.paint, ...ctx.paintDeclarations];
    ctx.paintDeclarations = [];
    paints.forEach(p => {
      ctx.paints.push(p);
      if ((0, _Box.isBoxCommand)(command)) {
        (0, _Box.drawBox)(ctx, command);
      } else if ((0, _Core.isCommand)(command, _Core.CommandType.DrawPaint)) {
        ctx.canvas.drawPaint(ctx.paint);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawImage)) {
        (0, _Drawing.drawImage)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawCircle)) {
        (0, _Drawing.drawCircle)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawPoints)) {
        (0, _Drawing.drawPoints)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawPath)) {
        (0, _Drawing.drawPath)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawRect)) {
        (0, _Drawing.drawRect)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawRRect)) {
        (0, _Drawing.drawRRect)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawOval)) {
        (0, _Drawing.drawOval)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawLine)) {
        (0, _Drawing.drawLine)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawPatch)) {
        (0, _Drawing.drawPatch)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawVertices)) {
        (0, _Drawing.drawVertices)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawDiffRect)) {
        (0, _Drawing.drawDiffRect)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawText)) {
        (0, _Drawing.drawText)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawTextPath)) {
        (0, _Drawing.drawTextPath)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawTextBlob)) {
        (0, _Drawing.drawTextBlob)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawGlyphs)) {
        (0, _Drawing.drawGlyphs)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawPicture)) {
        (0, _Drawing.drawPicture)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawImageSVG)) {
        (0, _Drawing.drawImageSVG)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawParagraph)) {
        (0, _Drawing.drawParagraph)(ctx, command.props);
      } else if ((0, _Core.isDrawCommand)(command, _Core.CommandType.DrawAtlas)) {
        (0, _Drawing.drawAtlas)(ctx, command.props);
      } else {
        console.warn(`Unknown command: ${command.type}`);
      }
      ctx.paints.pop();
    });
  }
}
const replay = (ctx, commands) => {
  "worklet";

  commands.forEach(command => {
    play(ctx, command);
  });
};
exports.replay = replay;
//# sourceMappingURL=Player.js.map