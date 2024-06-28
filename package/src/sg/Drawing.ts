import type {
  AtlasProps,
  CircleProps,
  DiffRectProps,
  ImageProps,
  ImageSVGProps,
  LineProps,
  OvalProps,
  PatchProps,
  PathProps,
  PictureProps,
  PointsProps,
  RectProps,
  RoundedRectProps,
  VerticesProps,
} from "../dom/nodes";
import {
  enumKey,
  fitRects,
  processCircle,
  processPath,
  processRRect,
  processRect,
} from "../dom/nodes";
import { saturate } from "../renderer";
import { BlendMode, FillType, PointMode, VertexMode } from "../skia";
import type { Skia } from "../skia/types";

import type { DrawingContext } from "./Context";

export const renderCircle = (ctx: DrawingContext, props: CircleProps) => {
  "worklet";
  const { c, r } = processCircle(ctx.Skia, props);
  ctx.canvas.drawCircle(c.x, c.y, r, ctx.paint);
};

export const renderFill = (ctx: DrawingContext) => {
  "worklet";
  ctx.canvas.drawPaint(ctx.paint);
};

export const renderPoints = (ctx: DrawingContext, props: PointsProps) => {
  "worklet";
  const { points, mode } = props;
  ctx.canvas.drawPoints(PointMode[enumKey(mode)], points, ctx.paint);
};

const computePath = (ctx: DrawingContext, props: PathProps) => {
  "worklet";
  const {
    start: trimStart,
    end: trimEnd,
    fillType,
    stroke,
    ...pathProps
  } = props;
  const start = saturate(trimStart);
  const end = saturate(trimEnd);
  const hasStartOffset = start !== 0;
  const hasEndOffset = end !== 1;
  const hasStrokeOptions = stroke !== undefined;
  const hasFillType = !!fillType;
  const willMutatePath =
    hasStartOffset || hasEndOffset || hasStrokeOptions || hasFillType;
  const pristinePath = processPath(ctx.Skia, pathProps.path);
  const path = willMutatePath ? pristinePath.copy() : pristinePath;
  if (hasFillType) {
    path.setFillType(FillType[enumKey(fillType)]);
  }
  if (hasStrokeOptions) {
    path.stroke(stroke);
  }
  if (hasStartOffset || hasEndOffset) {
    path.trim(start, end, false);
  }
  return path;
};

export const renderPath = (ctx: DrawingContext, props: PathProps) => {
  "worklet";
  const path = computePath(ctx, props);
  ctx.canvas.drawPath(path, ctx.paint);
};

export const renderRect = (ctx: DrawingContext, props: RectProps) => {
  "worklet";
  const rect = processRect(ctx.Skia, props);
  ctx.canvas.drawRect(rect, ctx.paint);
};

export const renderRRect = (ctx: DrawingContext, props: RoundedRectProps) => {
  "worklet";
  const rrect = processRRect(ctx.Skia, props);
  ctx.canvas.drawRRect(rrect, ctx.paint);
};

export const renderOval = (ctx: DrawingContext, props: OvalProps) => {
  "worklet";
  const oval = processRect(ctx.Skia, props);
  ctx.canvas.drawOval(oval, ctx.paint);
};

const processImage = (Skia: Skia, props: ImageProps) => {
  "worklet";
  const { image } = props;
  if (!image) {
    return {
      src: { x: 0, y: 0, width: 0, height: 0 },
      dst: { x: 0, y: 0, width: 0, height: 0 },
    };
  }
  const fit = props.fit ?? "contain";
  const rect = processRect(Skia, props);
  const { src, dst } = fitRects(
    fit,
    {
      x: 0,
      y: 0,
      width: image.width(),
      height: image.height(),
    },
    rect
  );
  return { src, dst };
};

export const renderImage = (ctx: DrawingContext, props: ImageProps) => {
  "worklet";
  const { image } = props;
  const { src, dst } = processImage(ctx.Skia, props);
  if (!image) {
    return;
  }
  ctx.canvas.drawImageRect(image, src, dst, ctx.paint);
};

export const renderLine = (ctx: DrawingContext, props: LineProps) => {
  "worklet";
  const { p1, p2 } = props;
  ctx.canvas.drawLine(p1.x, p1.y, p2.x, p2.y, ctx.paint);
};

const processPatch = (Skia: Skia, props: PatchProps) => {
  "worklet";
  const { colors, blendMode, patch } = props;
  const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
  const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
  // Patch requires a path with the following constraints:
  // M tl
  // C c1 c2 br
  // C c1 c2 bl
  // C c1 c2 tl (the redundant point in the last command is removed)
  return {
    mode,
    points: [
      patch[0].pos,
      patch[0].c2,
      patch[1].c1,
      patch[1].pos,
      patch[1].c2,
      patch[2].c1,
      patch[2].pos,
      patch[2].c2,
      patch[3].c1,
      patch[3].pos,
      patch[3].c2,
      patch[0].c1,
    ],
    colors: colors ? colors.map((c) => Skia.Color(c)) : undefined,
  };
};

export const renderPatch = (ctx: DrawingContext, props: PatchProps) => {
  "worklet";
  const { texture } = props;
  const { colors, points, mode } = processPatch(ctx.Skia, props);
  ctx.canvas.drawPatch(points, colors, texture, mode, ctx.paint);
};

export const renderVertices = (ctx: DrawingContext, props: VerticesProps) => {
  "worklet";
  const { colors, blendMode } = props;
  const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
  const blend = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
  const { mode, vertices, textures, indices } = props;
  const vertexMode = mode ? VertexMode[enumKey(mode)] : VertexMode.Triangles;
  const vert = ctx.Skia.MakeVertices(
    vertexMode,
    vertices,
    textures,
    colors ? colors.map((c) => ctx.Skia.Color(c)) : undefined,
    indices
  );
  ctx.canvas.drawVertices(vert, blend, ctx.paint);
};

export const renderDiffRect = (ctx: DrawingContext, props: DiffRectProps) => {
  "worklet";
  const { outer, inner } = props;
  ctx.canvas.drawDRRect(outer, inner, ctx.paint);
};

export const renderPicture = (ctx: DrawingContext, props: PictureProps) => {
  "worklet";
  const { picture } = props;
  ctx.canvas.drawPicture(picture);
};

const processImageSVG = (props: ImageSVGProps) => {
  "worklet";
  if (props.rect) {
    return props.rect;
  }
  const { x, y, width, height } = props;
  return { x, y, width, height };
};

export const renderImageSVG = (ctx: DrawingContext, props: ImageSVGProps) => {
  "worklet";
  const { svg } = props;

  const { x, y, width, height } = processImageSVG(props);
  if (svg === null) {
    return;
  }
  ctx.canvas.save();
  if (x && y) {
    ctx.canvas.translate(x, y);
  }
  ctx.canvas.drawSvg(svg, width, height);
  ctx.canvas.restore();
};

export const renderAtlas = (ctx: DrawingContext, props: AtlasProps) => {
  "worklet";
  const { image, sprites, transforms, colors, blendMode } = props;
  const blend = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
  if (image) {
    ctx.canvas.drawAtlas(image, sprites, transforms, ctx.paint, blend, colors);
  }
};
