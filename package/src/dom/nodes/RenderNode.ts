import type {
  SkMatrix,
  SkRect,
  SkRRect,
  SkPath,
  SkPaint,
} from "../../skia/types";
import { ClipOp, isRRect } from "../../skia/types";
import type {
  RenderNode,
  GroupProps,
  NodeType,
  Node,
  DrawingContext,
} from "../types";

import { isPathDef, processPath, processTransformProps } from "./datatypes";
import type { NodeContext } from "./Node";
import { JsiNode, JsiDeclarationNode } from "./Node";

const paintProps = [
  "color",
  "strokeWidth",
  "blendMode",
  "strokeCap",
  "strokeJoin",
  "strokeMiter",
  "style",
  "antiAlias",
  "opacity",
];

interface PaintCache {
  parent: SkPaint;
  child: SkPaint;
}

export abstract class JsiRenderNode<P extends GroupProps>
  extends JsiNode<P>
  implements RenderNode<P>
{
  paintCache: PaintCache | null = null;

  matrix: SkMatrix;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  clipPath?: SkPath;

  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, type, props);
    this.matrix = this.Skia.Matrix();
    this.onPropChange();
  }

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
  }

  setProp<K extends keyof P>(key: K, value: P[K]) {
    const hasChanged = super.setProp(key, value);
    if (hasChanged) {
      this.onPropChange();
      if (paintProps.includes(key as string)) {
        this.paintCache = null;
      }
    }
    return hasChanged;
  }

  protected onPropChange() {
    this.matrix.identity();
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.computeMatrix();
    this.computeClip();
  }

  addChild(child: Node<unknown>) {
    if (child instanceof JsiDeclarationNode) {
      child.setInvalidate(() => {
        this.paintCache = null;
      });
    }
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    if (child instanceof JsiDeclarationNode) {
      child.setInvalidate(() => {
        this.paintCache = null;
      });
    }
    super.insertChildBefore(child, before);
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
    processTransformProps(this.matrix, this.props);
  }

  render(ctx: DrawingContext) {
    const { invertClip, layer, matrix, transform } = this.props;
    const { canvas } = ctx;
    const parentPaint = ctx.paint;

    const cache =
      this.paintCache !== null && this.paintCache.parent === ctx.paint
        ? this.paintCache.child
        : undefined;
    const shouldRestore = ctx.saveAndConcat(this, cache);

    const hasTransform = matrix !== undefined || transform !== undefined;
    const hasClip =
      this.clipRect !== undefined ||
      this.clipPath !== undefined ||
      this.clipRRect !== undefined;
    const shouldSave = hasTransform || hasClip || !!layer;
    const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
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

    if (this.matrix) {
      canvas.concat(this.matrix);
    }
    if (this.clipRect) {
      canvas.clipRect(this.clipRect, op, true);
    } else if (this.clipRRect) {
      canvas.clipRRect(this.clipRRect, op, true);
    } else if (this.clipPath) {
      canvas.clipPath(this.clipPath, op, true);
    }

    this.renderNode(ctx);

    if (shouldSave) {
      canvas.restore();
    }
    if (shouldRestore) {
      this.paintCache = {
        parent: parentPaint,
        child: ctx.paint,
      };
      ctx.restore();
    }
  }

  abstract renderNode(ctx: DrawingContext): void;
}
