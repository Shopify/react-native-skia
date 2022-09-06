import type { RefObject } from "react";

import type {
  Skia,
  SkMatrix,
  SkRect,
  SkRRect,
  SkPath,
  SkPaint,
} from "../../skia/types";
import {
  StrokeCap,
  StrokeJoin,
  PaintStyle,
  BlendMode,
  ClipOp,
  processTransform,
  isRRect,
} from "../../skia/types";
import type {
  RenderNode,
  GroupProps,
  DrawingContext,
  NodeType,
  Node,
  DeclarationNode,
} from "../types";
import { DeclarationType } from "../types";

import { isPathDef, processPath } from "./datatypes";
import { JsiNode, JsiDeclarationNode } from "./Node";
import type { PaintContext } from "./PaintContext";
import { enumKey } from "./datatypes/Enum";

export const isSkPaint = (
  obj: RefObject<DeclarationNode<unknown, SkPaint>> | SkPaint
): obj is SkPaint => "__typename__" in obj && obj.__typename__ === "Paint";

const concatPaint = (
  parent: SkPaint,
  {
    color,
    strokeWidth,
    shader,
    antiAlias,
    blendMode,
    colorFilter,
    imageFilter,
    maskFilter,
    pathEffect,
    opacity: alpha,
    strokeCap,
    strokeJoin,
    strokeMiter,
    style,
  }: PaintContext,
  opacity: number
) => {
  const paint = parent.copy();
  if (color !== undefined) {
    paint.setShader(null);
    color[3] *= opacity;
    paint.setColor(color);
  } else {
    const cl = paint.getColor();
    cl[3] *= opacity;
    paint.setColor(cl);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (shader !== undefined) {
    paint.setShader(shader);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(blendMode);
  }
  if (colorFilter !== undefined) {
    paint.setColorFilter(colorFilter);
  }
  if (imageFilter !== undefined) {
    paint.setImageFilter(imageFilter);
  }
  if (maskFilter !== undefined) {
    paint.setMaskFilter(maskFilter);
  }
  if (pathEffect !== undefined) {
    paint.setPathEffect(pathEffect);
  }
  if (alpha !== undefined) {
    paint.setAlphaf(alpha * opacity);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(strokeCap);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(strokeJoin);
  }
  if (strokeMiter !== undefined) {
    paint.setStrokeMiter(strokeMiter);
  }
  if (style !== undefined) {
    paint.setStyle(style);
  }
  return paint;
};

export abstract class JsiRenderNode<P extends GroupProps>
  extends JsiNode<P>
  implements RenderNode<P>
{
  paint?: PaintContext;
  matrix?: SkMatrix;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  clipPath?: SkPath;

  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, type, props);
    this.onPropChange();
  }

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
  }

  setProp<K extends keyof P>(key: K, value: P[K]) {
    super.setProp(key, value);
    this.onPropChange();
  }

  protected onPropChange() {
    this.matrix = undefined;
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.paint = undefined;
    this.computeMatrix();
    this.computeClip();
    this.computePaintContext();
  }

  addChild(child: Node<unknown>) {
    super.addChild(child);
    if (child instanceof JsiDeclarationNode) {
      this.addToPaintContext(child);
    }
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    super.insertChildBefore(child, before);
    if (child instanceof JsiDeclarationNode) {
      this.addToPaintContext(child);
    }
  }

  // Here we use any because it's the type infered by "instanceof JsiDeclarationNode"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addToPaintContext(child: JsiDeclarationNode<any, any, any>) {
    if (this.paint === undefined) {
      this.paint = {};
    }
    if (child.declarationType === DeclarationType.Shader) {
      this.paint.shader = child.get();
      child.setInvalidate(() => {
        if (this.paint) {
          this.paint.shader = child.get();
        }
      });
    } else if (child.declarationType === DeclarationType.PathEffect) {
      this.paint.pathEffect = child.get();
      child.setInvalidate(() => {
        if (this.paint) {
          this.paint.pathEffect = child.get();
        }
      });
    } else if (child.declarationType === DeclarationType.MaskFilter) {
      this.paint.maskFilter = child.get();
      child.setInvalidate(() => {
        if (this.paint) {
          this.paint.maskFilter = child.get();
        }
      });
    } else if (child.declarationType === DeclarationType.ImageFilter) {
      this.paint.imageFilter = child.get();
      child.setInvalidate(() => {
        if (this.paint) {
          this.paint.imageFilter = child.get();
        }
      });
    } else if (child.declarationType === DeclarationType.ColorFilter) {
      this.paint.colorFilter = child.get();
      child.setInvalidate(() => {
        if (this.paint) {
          this.paint.colorFilter = child.get();
        }
      });
    }
  }

  private computeClip() {
    const { clip } = this.props;
    if (clip) {
      if (isPathDef(clip)) {
        this.clipPath = processPath(this.Skia, clip);
      } else if (isRRect(clip)) {
        this.clipRRect = clip;
      } else {
        this.clipRect = clip;
      }
    }
  }

  private computeMatrix() {
    const { transform, origin, matrix } = this.props;
    if (matrix) {
      if (origin) {
        const m = this.Skia.Matrix();
        m.translate(origin.x, origin.y);
        m.concat(matrix);
        m.translate(-origin.x, -origin.y);
        this.matrix = m;
      } else {
        this.matrix = matrix;
      }
    } else if (transform) {
      const m = this.Skia.Matrix();
      if (origin) {
        m.translate(origin.x, origin.y);
      }
      processTransform(m, transform);
      if (origin) {
        m.translate(-origin.x, -origin.y);
      }
      this.matrix = m;
    }
  }

  private computePaintContext() {
    const {
      color,
      strokeWidth,
      blendMode,
      style,
      strokeJoin,
      strokeCap,
      strokeMiter,
      opacity,
      antiAlias,
    } = this.props;
    if (
      color !== undefined ||
      strokeWidth !== undefined ||
      blendMode !== undefined ||
      style !== undefined ||
      strokeJoin !== undefined ||
      strokeCap !== undefined ||
      strokeMiter !== undefined ||
      opacity !== undefined ||
      antiAlias !== undefined
    ) {
      this.paint = {};
      if (color !== undefined) {
        this.paint.color = this.Skia.Color(color);
      }
      if (strokeWidth !== undefined) {
        this.paint.strokeWidth = strokeWidth;
      }
      if (blendMode !== undefined) {
        this.paint.blendMode = BlendMode[enumKey(blendMode)];
      }
      if (style !== undefined) {
        this.paint.style = PaintStyle[enumKey(style)];
      }
      if (strokeJoin !== undefined) {
        this.paint.strokeJoin = StrokeJoin[enumKey(strokeJoin)];
      }
      if (strokeCap !== undefined) {
        this.paint.strokeCap = StrokeCap[enumKey(strokeCap)];
      }
      if (strokeMiter !== undefined) {
        this.paint.strokeMiter = strokeMiter;
      }
      if (opacity !== undefined) {
        this.paint.opacity = opacity;
      }
      if (antiAlias !== undefined) {
        this.paint.antiAlias = antiAlias;
      }
    }
  }

  render(parentCtx: DrawingContext) {
    const { invertClip, layer } = this.props;
    const { canvas } = parentCtx;

    const opacity = this.props.opacity
      ? parentCtx.opacity * this.props.opacity
      : parentCtx.opacity;

    const paint = this.paint
      ? concatPaint(parentCtx.paint, this.paint, parentCtx.opacity)
      : parentCtx.paint;

    // TODO: can we only recreate a new context here if needed?
    const ctx = { ...parentCtx, opacity, paint };
    const hasTransform = this.matrix !== undefined;
    const hasClip = this.clipRect !== undefined;
    const shouldSave = hasTransform || hasClip || !!layer;
    const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;

    if (shouldSave) {
      if (layer) {
        if (typeof layer === "boolean") {
          canvas.saveLayer();
        } else if (isSkPaint(layer)) {
          canvas.saveLayer(layer);
        } else {
          canvas.saveLayer(layer.current ? layer.current.get() : undefined);
        }
      } else {
        canvas.save();
      }
    }

    if (this.matrix) {
      canvas.concat(this.matrix);
    }
    if (this.clipRect) {
      canvas.clipRect(this.clipRect, op, true);
    }
    if (this.clipRRect) {
      canvas.clipRRect(this.clipRRect, op, true);
    }
    if (this.clipPath) {
      canvas.clipPath(this.clipPath, op, true);
    }

    this.renderNode(ctx);

    if (shouldSave) {
      canvas.restore();
    }
  }

  abstract renderNode(ctx: DrawingContext): void;
}
