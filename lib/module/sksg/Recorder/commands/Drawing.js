import { enumKey, fitRects, processCircle, processColor, processPath, processRect, processRRect } from "../../../dom/nodes";
import { saturate } from "../../../renderer/processors";
import { BlendMode, FillType, FilterMode, isCubicSampling, MipmapMode, PointMode, VertexMode } from "../../../skia/types";
export const drawLine = (ctx, props) => {
  "worklet";

  const {
    p1,
    p2
  } = props;
  ctx.canvas.drawLine(p1.x, p1.y, p2.x, p2.y, ctx.paint);
};
export const drawOval = (ctx, props) => {
  "worklet";

  const rect = processRect(ctx.Skia, props);
  ctx.canvas.drawOval(rect, ctx.paint);
};
export const drawImage = (ctx, props) => {
  "worklet";

  const {
    image,
    sampling
  } = props;
  if (image) {
    var _props$fit;
    const fit = (_props$fit = props.fit) !== null && _props$fit !== void 0 ? _props$fit : "contain";
    const rect = processRect(ctx.Skia, props);
    const {
      src,
      dst
    } = fitRects(fit, {
      x: 0,
      y: 0,
      width: image.width(),
      height: image.height()
    }, rect);
    if (sampling && isCubicSampling(sampling)) {
      ctx.canvas.drawImageRectCubic(image, src, dst, sampling.B, sampling.C, ctx.paint);
    } else {
      var _sampling$filter, _sampling$mipmap;
      ctx.canvas.drawImageRectOptions(image, src, dst, (_sampling$filter = sampling === null || sampling === void 0 ? void 0 : sampling.filter) !== null && _sampling$filter !== void 0 ? _sampling$filter : FilterMode.Linear, (_sampling$mipmap = sampling === null || sampling === void 0 ? void 0 : sampling.mipmap) !== null && _sampling$mipmap !== void 0 ? _sampling$mipmap : MipmapMode.None, ctx.paint);
    }
  }
};
export const drawPoints = (ctx, props) => {
  "worklet";

  const {
    points,
    mode
  } = props;
  ctx.canvas.drawPoints(PointMode[enumKey(mode)], points, ctx.paint);
};
export const drawVertices = (ctx, props) => {
  "worklet";

  const {
    mode,
    textures,
    colors,
    indices,
    blendMode
  } = props;
  const vertexMode = mode ? VertexMode[enumKey(mode)] : VertexMode.Triangles;
  const vertices = ctx.Skia.MakeVertices(vertexMode, props.vertices, textures, colors ? colors.map(c => processColor(ctx.Skia, c)) : undefined, indices);
  const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
  const blend = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
  ctx.canvas.drawVertices(vertices, blend, ctx.paint);
};
export const drawDiffRect = (ctx, props) => {
  "worklet";

  const {
    outer,
    inner
  } = props;
  ctx.canvas.drawDRRect(outer, inner, ctx.paint);
};
export const drawTextPath = (ctx, props) => {
  "worklet";

  const path = processPath(ctx.Skia, props.path);
  const {
    font,
    initialOffset
  } = props;
  if (font) {
    let {
      text
    } = props;
    const ids = font.getGlyphIDs(text);
    const widths = font.getGlyphWidths(ids);
    const rsx = [];
    const meas = ctx.Skia.ContourMeasureIter(path, false, 1);
    let cont = meas.next();
    let dist = initialOffset;
    for (let i = 0; i < text.length && cont; i++) {
      const width = widths[i];
      dist += width / 2;
      if (dist > cont.length()) {
        // jump to next contour
        cont = meas.next();
        if (!cont) {
          // We have come to the end of the path - terminate the string
          // right here.
          text = text.substring(0, i);
          break;
        }
        dist = width / 2;
      }
      // Gives us the (x, y) coordinates as well as the cos/sin of the tangent
      // line at that position.
      const [p, t] = cont.getPosTan(dist);
      const adjustedX = p.x - width / 2 * t.x;
      const adjustedY = p.y - width / 2 * t.y;
      rsx.push(ctx.Skia.RSXform(t.x, t.y, adjustedX, adjustedY));
      dist += width / 2;
    }
    const derived = ctx.Skia.TextBlob.MakeFromRSXform(text, rsx, font);
    ctx.canvas.drawTextBlob(derived, 0, 0, ctx.paint);
  }
};
export const drawText = (ctx, props) => {
  "worklet";

  const {
    text,
    x,
    y,
    font
  } = props;
  if (font != null) {
    ctx.canvas.drawText(text, x, y, ctx.paint, font);
  }
};
export const drawPatch = (ctx, props) => {
  "worklet";

  const {
    texture,
    blendMode,
    patch
  } = props;
  const defaultBlendMode = props.colors ? BlendMode.DstOver : BlendMode.SrcOver;
  const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
  // Patch requires a path with the following constraints:
  // M tl
  // C c1 c2 br
  // C c1 c2 bl
  // C c1 c2 tl (the redundant point in the last command is removed)

  const points = [patch[0].pos, patch[0].c2, patch[1].c1, patch[1].pos, patch[1].c2, patch[2].c1, patch[2].pos, patch[2].c2, patch[3].c1, patch[3].pos, patch[3].c2, patch[0].c1];
  const colors = props.colors ? props.colors.map(c => processColor(ctx.Skia, c)) : undefined;
  ctx.canvas.drawPatch(points, colors, texture, mode, ctx.paint);
};
export const drawPath = (ctx, props) => {
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
  const willMutatePath = hasStartOffset || hasEndOffset || hasStrokeOptions || hasFillType;
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
  ctx.canvas.drawPath(path, ctx.paint);
};
export const drawRect = (ctx, props) => {
  "worklet";

  const derived = processRect(ctx.Skia, props);
  ctx.canvas.drawRect(derived, ctx.paint);
};
export const drawRRect = (ctx, props) => {
  "worklet";

  const derived = processRRect(ctx.Skia, props);
  ctx.canvas.drawRRect(derived, ctx.paint);
};
export const drawTextBlob = (ctx, props) => {
  "worklet";

  const {
    blob,
    x,
    y
  } = props;
  ctx.canvas.drawTextBlob(blob, x, y, ctx.paint);
};
export const drawGlyphs = (ctx, props) => {
  "worklet";

  const derived = props.glyphs.reduce((acc, glyph) => {
    const {
      id,
      pos
    } = glyph;
    acc.glyphs.push(id);
    acc.positions.push(pos);
    return acc;
  }, {
    glyphs: [],
    positions: []
  });
  const {
    glyphs,
    positions
  } = derived;
  const {
    x,
    y,
    font
  } = props;
  if (font) {
    ctx.canvas.drawGlyphs(glyphs, positions, x, y, font, ctx.paint);
  }
};
export const drawImageSVG = (ctx, props) => {
  "worklet";

  const {
    canvas
  } = ctx;
  const {
    svg
  } = props;
  const {
    x,
    y,
    width,
    height
  } = props.rect ? props.rect : {
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height
  };
  if (svg === null) {
    return;
  }
  canvas.save();
  if (x && y) {
    canvas.translate(x, y);
  }
  canvas.drawSvg(svg, width, height);
  canvas.restore();
};
export const drawParagraph = (ctx, props) => {
  "worklet";

  const {
    paragraph,
    x,
    y,
    width
  } = props;
  if (paragraph) {
    paragraph.layout(width);
    paragraph.paint(ctx.canvas, x, y);
  }
};
export const drawPicture = (ctx, props) => {
  "worklet";

  const {
    picture
  } = props;
  ctx.canvas.drawPicture(picture);
};
export const drawAtlas = (ctx, props) => {
  "worklet";

  const {
    image,
    sprites,
    transforms,
    colors,
    blendMode,
    sampling
  } = props;
  const blend = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
  if (image) {
    ctx.canvas.drawAtlas(image, sprites, transforms, ctx.paint, blend, colors, sampling);
  }
};
export const drawCircle = (ctx, props) => {
  "worklet";

  const {
    c
  } = processCircle(props);
  const {
    r
  } = props;
  ctx.canvas.drawCircle(c.x, c.y, r, ctx.paint);
};
export const drawFill = (ctx, _props) => {
  "worklet";

  ctx.canvas.drawPaint(ctx.paint);
};
//# sourceMappingURL=Drawing.js.map