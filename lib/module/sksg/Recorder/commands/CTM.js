import { isPathDef, processPath, processTransformProps2 } from "../../../dom/nodes";
import { ClipOp, isRRect } from "../../../skia/types";
const computeClip = (Skia, clip) => {
  "worklet";

  if (clip) {
    if (isPathDef(clip)) {
      return {
        clipPath: processPath(Skia, clip)
      };
    } else if (isRRect(clip)) {
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
export const saveCTM = (ctx, props) => {
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
  const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
  const m3 = processTransformProps2(Skia, {
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
//# sourceMappingURL=CTM.js.map