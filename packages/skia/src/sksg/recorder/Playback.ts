"worklet";

import type { SharedValue } from "react-native-reanimated";

import type {
  AtlasProps,
  CircleProps,
  ClipDef,
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
  TextBlobProps,
  TextPathProps,
  TextProps,
  VerticesProps,
} from "../../dom/types";
import { exhaustiveCheck } from "../../renderer/typeddash";
import {
  BlendMode,
  ClipOp,
  isRRect,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from "../../skia/types";
import type {
  SkPath,
  SkRect,
  SkRRect,
  Skia,
  SkCanvas,
  SkImageFilter,
  SkPaint,
} from "../../skia/types";
import type { Node } from "../nodes";
import { isSharedValue, processDeclarations } from "../nodes";
import {
  drawAtlas,
  drawCircle,
  drawDiffRect,
  drawGlyphs,
  drawImage,
  drawImageSVG,
  drawLine,
  drawOval,
  drawParagraph,
  drawPatch,
  drawPath,
  drawPicture,
  drawPoints,
  drawRect,
  drawRRect,
  drawText,
  drawTextBlob,
  drawTextPath,
  drawVertices,
} from "../nodes/drawings";
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

export const playback = (
  Skia: Skia,
  canvas: SkCanvas,
  staticCtx: StaticContext
) => {
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
        const {
          opacity,
          color,
          blendMode,
          strokeWidth,
          style,
          strokeJoin,
          strokeCap,
          strokeMiter,
          antiAlias,
          dither,
        } = props as PaintProps;
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
        if (strokeWidth !== undefined) {
          paint.setStrokeWidth(strokeWidth);
        }
        if (style !== undefined) {
          paint.setStyle(PaintStyle[enumKey(style)]);
        }
        if (strokeJoin !== undefined) {
          paint.setStrokeJoin(StrokeJoin[enumKey(strokeJoin)]);
        }
        if (strokeCap !== undefined) {
          paint.setStrokeCap(StrokeCap[enumKey(strokeCap)]);
        }
        if (strokeMiter !== undefined) {
          paint.setStrokeMiter(strokeMiter);
        }
        if (antiAlias !== undefined) {
          paint.setAntiAlias(antiAlias);
        }
        if (dither !== undefined) {
          paint.setDither(dither);
        }
        const pProps = props as PaintProps;
        if (pProps.children.length > 0) {
          pProps.children.forEach((child) => {
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
        }
        break;
      }
      case CommandType.PushStaticPaint:
        paints.push(props as SkPaint);
        break;
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
      case CommandType.PushLayer: {
        const dCtx = createDeclarationContext(ctx.Skia);
        if (props) {
          processDeclarations(dCtx, props as Node);
          const p = dCtx.paints.pop();
          if (p) {
            ctx.canvas.saveLayer(p);
          }
        } else {
          ctx.canvas.saveLayer();
        }
        break;
      }
      case CommandType.PopLayer:
        canvas.restore();
        break;
      case CommandType.BackdropFilter: {
        let imageFilter: SkImageFilter | null = null;
        // TODO: can  we use the main declaration context here?
        const dCtx = createDeclarationContext(ctx.Skia);
        processDeclarations(dCtx, props as Node);
        const imgf = dCtx.imageFilters.pop();
        if (imgf) {
          imageFilter = imgf;
        } else {
          const cf = dCtx.colorFilters.pop();
          if (cf) {
            imageFilter = Skia.ImageFilter.MakeColorFilter(cf, null);
          }
        }
        canvas.saveLayer(undefined, null, imageFilter);
        canvas.restore();
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
      case CommandType.DrawImage:
        drawImage(ctx, props as ImageProps);
        break;
      case CommandType.DrawAtlas:
        drawAtlas(ctx, props as AtlasProps);
        break;
      case CommandType.DrawDiffRect:
        drawDiffRect(ctx, props as DiffRectProps);
        break;
      case CommandType.DrawImageSVG:
        drawImageSVG(ctx, props as ImageSVGProps);
        break;
      case CommandType.DrawLine:
        drawLine(ctx, props as LineProps);
        break;
      case CommandType.DrawOval:
        drawOval(ctx, props as OvalProps);
        break;
      case CommandType.DrawParagraph:
        drawParagraph(ctx, props as ParagraphProps);
        break;
      case CommandType.DrawPatch:
        drawPatch(ctx, props as PatchProps);
        break;
      case CommandType.DrawPath:
        drawPath(ctx, props as PathProps);
        break;
      case CommandType.DrawPicture:
        drawPicture(ctx, props as PictureProps);
        break;
      case CommandType.DrawPoints:
        drawPoints(ctx, props as PointsProps);
        break;
      case CommandType.DrawRect:
        drawRect(ctx, props as RectProps);
        break;
      case CommandType.DrawRRect:
        drawRRect(ctx, props as RoundedRectProps);
        break;
      case CommandType.DrawText:
        drawText(ctx, props as TextProps);
        break;
      case CommandType.DrawTextBlob:
        drawTextBlob(ctx, props as TextBlobProps);
        break;
      case CommandType.DrawTextPath:
        drawTextPath(ctx, props as TextPathProps);
        break;
      case CommandType.DrawVertices:
        drawVertices(ctx, props as VerticesProps);
        break;
      default:
        exhaustiveCheck(command.type);
    }
  }
};
