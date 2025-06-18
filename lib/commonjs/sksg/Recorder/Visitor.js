"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visit = exports.processPaint = void 0;
var _types = require("../../dom/types");
var _Node = require("../Node");
/* eslint-disable @typescript-eslint/no-explicit-any */

const processPaint = ({
  opacity,
  color,
  strokeWidth,
  blendMode,
  style,
  strokeJoin,
  strokeCap,
  strokeMiter,
  antiAlias,
  dither,
  paint: paintRef
}) => {
  const paint = {};
  if (opacity !== undefined) {
    paint.opacity = opacity;
  }
  if (color !== undefined) {
    paint.color = color;
  }
  if (strokeWidth !== undefined) {
    paint.strokeWidth = strokeWidth;
  }
  if (blendMode !== undefined) {
    paint.blendMode = blendMode;
  }
  if (style !== undefined) {
    paint.style = style;
  }
  if (strokeJoin !== undefined) {
    paint.strokeJoin = strokeJoin;
  }
  if (strokeCap !== undefined) {
    paint.strokeCap = strokeCap;
  }
  if (strokeMiter !== undefined) {
    paint.strokeMiter = strokeMiter;
  }
  if (antiAlias !== undefined) {
    paint.antiAlias = antiAlias;
  }
  if (dither !== undefined) {
    paint.dither = dither;
  }
  if (paintRef !== undefined) {
    paint.paint = paintRef;
  }
  if (opacity !== undefined || color !== undefined || strokeWidth !== undefined || blendMode !== undefined || style !== undefined || strokeJoin !== undefined || strokeCap !== undefined || strokeMiter !== undefined || antiAlias !== undefined || dither !== undefined || paintRef !== undefined) {
    return paint;
  }
  return null;
};
exports.processPaint = processPaint;
const processCTM = ({
  clip,
  invertClip,
  transform,
  origin,
  matrix,
  layer
}) => {
  const ctm = {};
  if (clip) {
    ctm.clip = clip;
  }
  if (invertClip) {
    ctm.invertClip = invertClip;
  }
  if (transform) {
    ctm.transform = transform;
  }
  if (origin) {
    ctm.origin = origin;
  }
  if (matrix) {
    ctm.matrix = matrix;
  }
  if (layer) {
    ctm.layer = layer;
  }
  if (clip !== undefined || invertClip !== undefined || transform !== undefined || origin !== undefined || matrix !== undefined || layer !== undefined) {
    return ctm;
  }
  return null;
};
const pushColorFilters = (recorder, colorFilters) => {
  colorFilters.forEach(colorFilter => {
    if (colorFilter.children.length > 0) {
      pushColorFilters(recorder, colorFilter.children);
    }
    recorder.pushColorFilter(colorFilter.type, colorFilter.props);
    const needsComposition = colorFilter.type !== _types.NodeType.LerpColorFilter && colorFilter.children.length > 0;
    if (needsComposition) {
      recorder.composeColorFilter();
    }
  });
};
const pushPathEffects = (recorder, pathEffects) => {
  pathEffects.forEach(pathEffect => {
    if (pathEffect.children.length > 0) {
      pushPathEffects(recorder, pathEffect.children);
    }
    recorder.pushPathEffect(pathEffect.type, pathEffect.props);
    const needsComposition = pathEffect.type !== _types.NodeType.SumPathEffect && pathEffect.children.length > 0;
    if (needsComposition) {
      recorder.composePathEffect();
    }
  });
};
const pushImageFilters = (recorder, imageFilters) => {
  imageFilters.forEach(imageFilter => {
    if (imageFilter.children.length > 0) {
      pushImageFilters(recorder, imageFilter.children);
    }
    if ((0, _Node.isImageFilter)(imageFilter.type)) {
      recorder.pushImageFilter(imageFilter.type, imageFilter.props);
    } else if ((0, _Node.isShader)(imageFilter.type)) {
      recorder.pushShader(imageFilter.type, imageFilter.props);
    }
    const needsComposition = imageFilter.type !== _types.NodeType.BlendImageFilter && imageFilter.children.length > 0;
    if (needsComposition) {
      recorder.composeImageFilter();
    }
  });
};
const pushShaders = (recorder, shaders) => {
  shaders.forEach(shader => {
    if (shader.children.length > 0) {
      pushShaders(recorder, shader.children);
    }
    recorder.pushShader(shader.type, shader.props);
  });
};
const pushMaskFilters = (recorder, maskFilters) => {
  if (maskFilters.length > 0) {
    recorder.pushBlurMaskFilter(maskFilters[maskFilters.length - 1].props);
  }
};
const pushPaints = (recorder, paints) => {
  paints.forEach(paint => {
    recorder.savePaint(paint.props);
    const {
      colorFilters,
      maskFilters,
      shaders,
      imageFilters,
      pathEffects
    } = (0, _Node.sortNodeChildren)(paint);
    pushColorFilters(recorder, colorFilters);
    pushImageFilters(recorder, imageFilters);
    pushMaskFilters(recorder, maskFilters);
    pushShaders(recorder, shaders);
    pushPathEffects(recorder, pathEffects);
    recorder.restorePaintDeclaration();
  });
};
const visitNode = (recorder, node) => {
  if (node.type === _types.NodeType.Group) {
    recorder.saveGroup();
  }
  const {
    props
  } = node;
  const {
    colorFilters,
    maskFilters,
    drawings,
    shaders,
    imageFilters,
    pathEffects,
    paints
  } = (0, _Node.sortNodeChildren)(node);
  const paint = processPaint(props);
  const shouldPushPaint = paint || colorFilters.length > 0 || maskFilters.length > 0 || imageFilters.length > 0 || pathEffects.length > 0 || shaders.length > 0;
  if (shouldPushPaint) {
    recorder.savePaint(paint !== null && paint !== void 0 ? paint : {});
    pushColorFilters(recorder, colorFilters);
    pushImageFilters(recorder, imageFilters);
    pushMaskFilters(recorder, maskFilters);
    pushShaders(recorder, shaders);
    pushPathEffects(recorder, pathEffects);
    // For mixed nodes like BackdropFilters we don't materialize the paint
    if (node.type === _types.NodeType.BackdropFilter) {
      recorder.saveBackdropFilter();
    } else {
      recorder.materializePaint();
    }
  }
  pushPaints(recorder, paints);
  if (node.type === _types.NodeType.Layer) {
    recorder.saveLayer();
  }
  const ctm = processCTM(props);
  const shouldRestore = !!ctm || node.type === _types.NodeType.Layer;
  if (ctm) {
    recorder.saveCTM(ctm);
  }
  switch (node.type) {
    case _types.NodeType.Box:
      const shadows = node.children.filter(n => n.type === _types.NodeType.BoxShadow)
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .map(({
        props
      }) => ({
        props
      }));
      recorder.drawBox(props, shadows);
      break;
    case _types.NodeType.Fill:
      recorder.drawPaint();
      break;
    case _types.NodeType.Image:
      recorder.drawImage(props);
      break;
    case _types.NodeType.Circle:
      recorder.drawCircle(props);
      break;
    case _types.NodeType.Points:
      recorder.drawPoints(props);
      break;
    case _types.NodeType.Path:
      recorder.drawPath(props);
      break;
    case _types.NodeType.Rect:
      recorder.drawRect(props);
      break;
    case _types.NodeType.RRect:
      recorder.drawRRect(props);
      break;
    case _types.NodeType.Oval:
      recorder.drawOval(props);
      break;
    case _types.NodeType.Line:
      recorder.drawLine(props);
      break;
    case _types.NodeType.Patch:
      recorder.drawPatch(props);
      break;
    case _types.NodeType.Vertices:
      recorder.drawVertices(props);
      break;
    case _types.NodeType.DiffRect:
      recorder.drawDiffRect(props);
      break;
    case _types.NodeType.Text:
      recorder.drawText(props);
      break;
    case _types.NodeType.TextPath:
      recorder.drawTextPath(props);
      break;
    case _types.NodeType.TextBlob:
      recorder.drawTextBlob(props);
      break;
    case _types.NodeType.Glyphs:
      recorder.drawGlyphs(props);
      break;
    case _types.NodeType.Picture:
      recorder.drawPicture(props);
      break;
    case _types.NodeType.ImageSVG:
      recorder.drawImageSVG(props);
      break;
    case _types.NodeType.Paragraph:
      recorder.drawParagraph(props);
      break;
    case _types.NodeType.Atlas:
      recorder.drawAtlas(props);
      break;
  }
  drawings.forEach(drawing => {
    visitNode(recorder, drawing);
  });
  if (shouldPushPaint) {
    recorder.restorePaint();
  }
  if (shouldRestore) {
    recorder.restoreCTM();
  }
  if (node.type === _types.NodeType.Group) {
    recorder.restoreGroup();
  }
};
const visit = (recorder, root) => {
  root.forEach(node => {
    visitNode(recorder, node);
  });
};
exports.visit = visit;
//# sourceMappingURL=Visitor.js.map