"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveCTM = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../skia/types");
const computeClip = (Skia, clip) => {
  "worklet";

  if (clip) {
    if ((0, _nodes.isPathDef)(clip)) {
      return {
        clipPath: (0, _nodes.processPath)(Skia, clip)
      };
    } else if ((0, _types.isRRect)(clip)) {
      return {
        clipRRect: clip
      };
    } else {
      return {
        clipRect: clip
      };
    }
  }
  return undefined;
};
const saveCTM = (ctx, props) => {
  "worklet";

  const {
    canvas,
    Skia
  } = ctx;
  const {
    clip: rawClip,
    invertClip,
    matrix,
    transform,
    origin,
    layer
  } = props;
  const hasTransform = matrix !== undefined || transform !== undefined;
  const clip = computeClip(Skia, rawClip);
  const hasClip = clip !== undefined;
  const op = invertClip ? _types.ClipOp.Difference : _types.ClipOp.Intersect;
  const m3 = (0, _nodes.processTransformProps2)(Skia, {
    matrix,
    transform,
    origin
  });
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
};
exports.saveCTM = saveCTM;
//# sourceMappingURL=CTM.js.map