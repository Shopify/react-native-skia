"worklet";

import type { SharedValue } from "react-native-reanimated";

import type {
  CircleProps,
  ClipDef,
  CTMProps,
  GlyphsProps,
} from "../../dom/types";
import { exhaustiveCheck } from "../../renderer/typeddash";
import { BlendMode, ClipOp, isRRect } from "../../skia/types";
import type { SkPath, SkRect, SkRRect, Skia } from "../../skia/types";
import { isSharedValue, processDeclarations } from "../nodes";
import { drawCircle, drawGlyphs } from "../nodes/drawings";
import type { StaticContext } from "../StaticContext";
import {
  enumKey,
  isPathDef,
  processPath,
  processTransformProps2,
} from "../../dom/nodes";
import { createDeclarationContext } from "../DeclarationContext";

import type { PaintProps } from "./Paint";
import { CommandType } from "./Recorder";

const materializeValue = <T>(value: T | SharedValue<T>) => {
  return (isSharedValue(value) ? value.value : value) as T;
};

const computeClip = (
  Skia: Skia,
  clip: ClipDef | undefined
):
  | undefined
  | { clipPath: SkPath }
  | { clipRect: SkRect }
  | { clipRRect: SkRRect } => {
  "worklet";
  if (clip) {
    if (isPathDef(clip)) {
      return { clipPath: processPath(Skia, clip) };
    } else if (isRRect(clip)) {
      return { clipRRect: clip };
    } else {
      return { clipRect: clip };
    }
  }
  return undefined;
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
  const declCtx = createDeclarationContext(Skia);
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
        (props as PaintProps).children.forEach((child) => {
          processDeclarations(declCtx, child);
        });
        const colorFilter = declCtx.colorFilters.popAllAsOne();
        const imageFilter = declCtx.imageFilters.popAllAsOne();
        const shader = declCtx.shaders.pop();
        const maskFilter = declCtx.maskFilters.pop();
        const pathEffect = declCtx.pathEffects.popAllAsOne();
        if (colorFilter) {
          paint.setColorFilter(colorFilter);
        }
        if (imageFilter) {
          paint.setImageFilter(imageFilter);
        }
        if (shader) {
          paint.setShader(shader);
        }
        if (maskFilter) {
          paint.setMaskFilter(maskFilter);
        }
        if (pathEffect) {
          paint.setPathEffect(pathEffect);
        }
        break;
      }
      case CommandType.PopPaint:
        paints.pop();
        break;
      case CommandType.PushCTM: {
        const {
          clip: rawClip,
          invertClip,
          matrix,
          transform,
          origin,
          layer,
        } = props as CTMProps;
        const hasTransform = matrix !== undefined || transform !== undefined;
        const clip = computeClip(Skia, rawClip);
        const hasClip = clip !== undefined;
        const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
        const m3 = processTransformProps2(Skia, { matrix, transform, origin });
        const shouldSave = hasTransform || hasClip || !!layer;
        if (shouldSave) {
          if (layer) {
            if (typeof layer === "boolean") {
              canvas.saveLayer();
            } else {
              canvas.saveLayer(layer);
            }
          } else {
            canvas.save();
          }
        }
        if (m3) {
          canvas.concat(m3);
        }
        if (clip) {
          if ("clipRect" in clip) {
            canvas.clipRect(clip.clipRect, op, true);
          } else if ("clipRRect" in clip) {
            canvas.clipRRect(clip.clipRRect, op, true);
          } else {
            canvas.clipPath(clip.clipPath, op, true);
          }
        }
        break;
      }
      case CommandType.PopCTM:
        canvas.restore();
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
