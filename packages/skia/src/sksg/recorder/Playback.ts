"worklet";

import type { SharedValue } from "react-native-reanimated";

import type { CircleProps, GlyphsProps } from "../../dom/types";
import { exhaustiveCheck } from "../../renderer/typeddash";
import { BlendMode, type Skia } from "../../skia/types";
import { isSharedValue } from "../nodes";
import { drawCircle, drawGlyphs } from "../nodes/drawings";
import type { StaticContext } from "../StaticContext";
import { enumKey } from "../../dom/nodes";

import type { PaintProps } from "./Paint";
import { CommandType } from "./Recorder";

const materializeValue = <T>(value: T | SharedValue<T>) => {
  return (isSharedValue(value) ? value.value : value) as T;
};

const processColor = (
  Skia: Skia,
  color: number | string | Float32Array | number[]
) => {
  "worklet";
  if (typeof color === "string" || typeof color === "number") {
    return Skia.Color(color);
  } else if (Array.isArray(color) || color instanceof Float32Array) {
    return color instanceof Float32Array ? color : new Float32Array(color);
  } else {
    throw new Error(
      `Invalid color type: ${typeof color}. Expected number, string, or array.`
    );
  }
};

export const playback = (Skia: Skia, staticCtx: StaticContext) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  const { commands } = staticCtx;
  const paints = [staticCtx.paints[0]];
  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    let paint = paints[paints.length - 1];
    const { props } = command;
    if (command.animatedProps) {
      Object.keys(command.animatedProps).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        props[key] = command.animatedProps[key].value;
      });
    }
    const ctx = { canvas, Skia, paint };
    switch (command.type) {
      case CommandType.PushPaint: {
        const j = paints.length;
        if (!staticCtx.paints[j]) {
          staticCtx.paints.push(Skia.Paint());
        }
        const childPaint = staticCtx.paints[j];
        childPaint.assign(paint);
        paints.push(childPaint);
        paint = childPaint;
        const { opacity, color, blendMode } = props as PaintProps;
        if (opacity !== undefined) {
          paint.setAlphaf(paint.getAlphaf() * materializeValue(opacity));
        }
        if (color !== undefined) {
          const currentOpacity = paint.getAlphaf();
          paint.setShader(null);
          paint.setColor(processColor(Skia, materializeValue(color)));
          paint.setAlphaf(currentOpacity * paint.getAlphaf());
        }
        if (blendMode !== undefined) {
          paint.setBlendMode(BlendMode[enumKey(materializeValue(blendMode))]);
        }
        break;
      }
      case CommandType.PopPaint:
        paints.pop();
        break;
      case CommandType.DrawPaint:
        canvas.drawPaint(paint);
        break;
      case CommandType.DrawGlyphs:
        drawGlyphs(ctx, props as GlyphsProps);
        break;
      case CommandType.DrawCircle:
        drawCircle(ctx, props as CircleProps);
        break;
      default:
        exhaustiveCheck(command.type);
    }
  }
  return recorder.finishRecordingAsPicture();
};
