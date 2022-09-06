import type {
  SkShader,
  SkColorFilter,
  SkImageFilter,
  SkMaskFilter,
  SkPathEffect,
  SkPaint,
  Skia,
} from "../../skia/types";
import { BlendMode, PaintStyle, StrokeJoin, StrokeCap } from "../../skia/types";
import type { DeclarationNode, Node, PaintProps } from "../types";
import { DeclarationType, NodeType } from "../types";

import { enumKey, processColor } from "./datatypes";
import { JsiDeclarationNode } from "./Node";

interface PaintChildren {
  shader: SkShader | null;
  colorFilter: SkColorFilter | null;
  imageFilter: SkImageFilter | null;
  maskFilter: SkMaskFilter | null;
  pathEffect: SkPathEffect | null;
}

export class PaintNode
  extends JsiDeclarationNode<PaintProps, SkPaint>
  implements DeclarationNode<PaintProps, SkPaint>
{
  private cache: SkPaint | null = null;

  constructor(Skia: Skia, props: PaintProps = {}) {
    super(Skia, DeclarationType.Paint, NodeType.Paint, props);
    this.setInvalidate(() => {
      // TODO: this should do nothing in PaintNode: double check
      //console.log("invalidate paint");
    });
  }

  setProps(props: PaintProps) {
    super.setProps(props);
    this.cache = null;
  }

  setProp<K extends keyof PaintProps>(name: K, v: PaintProps[K]) {
    super.setProp(name, v);
    this.cache = null;
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    child.setInvalidate(() => (this.cache = null));
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    child.setInvalidate(() => (this.cache = null));
    super.insertChildBefore(child, before);
  }

  removeChild(child: Node<unknown>) {
    this.cache = null;
    return super.removeChild(child);
  }

  concat(parentPaint: SkPaint, currentOpacity: number) {
    const {
      color,
      blendMode,
      style,
      strokeJoin,
      strokeMiter,
      strokeCap,
      strokeWidth,
      opacity,
      antiAlias,
    } = this.props;
    if (this.cache !== null) {
      return this.cache;
    }
    // TODO: this should/could be cached
    const paint = this.props.paint ? this.props.paint : parentPaint.copy();
    // Props
    if (color !== undefined) {
      const c = processColor(this.Skia, color, currentOpacity);
      paint.setShader(null);
      paint.setColor(c);
    } else {
      const c = processColor(this.Skia, paint.getColor(), currentOpacity);
      paint.setColor(c);
    }
    if (blendMode !== undefined) {
      paint.setBlendMode(BlendMode[enumKey(blendMode)]);
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
    if (strokeWidth !== undefined) {
      paint.setStrokeWidth(strokeWidth);
    }
    if (opacity !== undefined) {
      paint.setAlphaf(opacity);
    }
    if (antiAlias !== undefined) {
      paint.setAntiAlias(antiAlias);
    }
    const { shader, colorFilter, imageFilter, maskFilter, pathEffect } =
      this.children().reduce<PaintChildren>(
        (r, child) => {
          if (child instanceof JsiDeclarationNode) {
            if (child.isShader()) {
              r.shader = child.get();
            } else if (child.isColorFilter()) {
              r.colorFilter = child.get();
            } else if (child.isImageFilter()) {
              r.imageFilter = child.get();
            } else if (child.isPathEffect()) {
              r.pathEffect = child.get();
            }
          }
          return r;
        },
        {
          shader: null,
          colorFilter: null,
          imageFilter: null,
          maskFilter: null,
          pathEffect: null,
        }
      );
    // Children
    if (shader !== null) {
      paint.setShader(shader);
    }
    if (maskFilter !== null) {
      paint.setMaskFilter(maskFilter);
    }
    if (pathEffect !== null) {
      paint.setPathEffect(pathEffect);
    }
    if (imageFilter !== null) {
      paint.setImageFilter(imageFilter);
    }
    if (colorFilter !== null) {
      paint.setColorFilter(colorFilter);
    }
    this.cache = paint;
    return paint;
  }

  get() {
    return this.concat(this.Skia.Paint(), 1);
  }
}
