import type { RefObject } from "react";

import type {
  SkColorFilter,
  Skia,
  SkImageFilter,
  SkMaskFilter,
  SkShader,
  SkPathEffect,
  SkMatrix,
  SkRect,
  SkRRect,
  SkPath,
  SkPaint,
} from "../../skia/types";
import {
  PaintStyle,
  StrokeJoin,
  StrokeCap,
  BlendMode,
  ClipOp,
  processTransform,
  isRRect,
} from "../../skia/types";
import type {
  Node,
  DeclarationNode,
  LeafDeclarationNode,
  RenderNode,
  GroupProps,
  DrawingContext,
  PaintProps,
} from "../types";
import { DeclarationType, NodeType } from "../types";

import { enumKey, isPathDef, processColor, processPath } from "./datatypes";

export abstract class JsiNode<P> implements Node<P> {
  protected _children: Node<unknown>[] = [];

  constructor(
    protected Skia: Skia,
    public type: NodeType,
    protected props: P
  ) {}

  setProps(props: P) {
    this.props = props;
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    this.props[name] = v;
  }

  getProps() {
    return this.props;
  }

  children() {
    return this._children;
  }

  descendant() {
    const result: Node<unknown>[] = [];
    for (const child of this._children) {
      result.push(child);
      result.push(...child.descendant());
    }
    return result;
  }

  addChild(child: Node<unknown>) {
    this._children.push(child);
  }

  removeChild(child: Node<unknown>) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      const [node] = this._children.splice(index, 1);
      return [node, ...node.descendant()];
    }
    return [];
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
    const beforeIndex = this._children.indexOf(before);
    this._children.splice(beforeIndex, 0, child);
  }
}

export type Invalidate = () => void;

export abstract class JsiDeclarationNode<
    P,
    T,
    Nullable extends null | never = never
  >
  extends JsiNode<P>
  implements DeclarationNode<P, T, Nullable>
{
  private invalidate: Invalidate | null = null;
  constructor(
    Skia: Skia,
    public declarationType: DeclarationType,
    type: NodeType,
    props: P
  ) {
    super(Skia, type, props);
  }

  abstract get(): T | Nullable;

  // TODO: add checks and option if the child can be null
  getChild<C>(index: number) {
    const child = this._children[index] as JsiDeclarationNode<unknown, C>;
    return child.get();
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add child of type ${child.type} to ${this.type}`);
    }
    super.insertChildBefore(child, before);
  }

  setInvalidate(invalidate: Invalidate) {
    this.invalidate = invalidate;
  }

  setProps(props: P) {
    if (!this.invalidate) {
      throw new Error(
        "Setting props on a declaration not attached to a drawing"
      );
    }
    super.setProps(props);
    this.invalidate();
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    if (!this.invalidate) {
      throw new Error(
        "Setting props on a declaration not attached to a drawing"
      );
    }
    super.setProp(name, v);
    this.invalidate();
  }

  isPaint(): this is DeclarationNode<unknown, SkPaint> {
    return this.declarationType === DeclarationType.Paint;
  }

  isImageFilter(): this is DeclarationNode<unknown, SkImageFilter> {
    return this.declarationType === DeclarationType.ImageFilter;
  }

  isColorFilter(): this is DeclarationNode<unknown, SkColorFilter> {
    return this.declarationType === DeclarationType.ColorFilter;
  }

  isShader(): this is DeclarationNode<unknown, SkShader> {
    return this.declarationType === DeclarationType.Shader;
  }

  isMaskFilter(): this is DeclarationNode<unknown, SkMaskFilter> {
    return this.declarationType === DeclarationType.MaskFilter;
  }

  isPathEffect(): this is DeclarationNode<unknown, SkPathEffect> {
    return this.declarationType === DeclarationType.PathEffect;
  }
}

export abstract class JsiLeafDeclarationNode<
    P,
    T,
    Nullable extends null | never = never
  >
  extends JsiDeclarationNode<P, T, Nullable>
  implements LeafDeclarationNode<P, T, Nullable>
{
  addChild(_child: Node<unknown>): void {
    throw new Error(`Cannot add child to ${this.type}`);
  }

  removeChild(_child: Node<unknown>): Node<unknown>[] {
    throw new Error(`Cannot remove child from ${this.type}`);
  }

  insertChildBefore(_child: Node<unknown>, _before: Node<unknown>): void {
    throw new Error(`Cannot insert child into ${this.type}`);
  }
}

const isSkPaint = (obj: RefObject<SkPaint> | SkPaint): obj is SkPaint =>
  "__typename__" in obj && obj.__typename__ === "Paint";

export abstract class JsiRenderNode<P extends GroupProps>
  extends JsiNode<P>
  implements RenderNode<P>
{
  paint?: JsiPaintNode;
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

  protected onPropChange() {
    this.matrix = undefined;
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.paint = undefined;
    if (this.hasCustomPaint()) {
      this.paint = new JsiPaintNode(this.Skia, this.props);
    }
    this.computeMatrix();
    this.computeClip();
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
      this.matrix = matrix;
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

  private hasCustomPaint() {
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
    return (
      color !== undefined ||
      strokeWidth !== undefined ||
      blendMode !== undefined ||
      style !== undefined ||
      strokeJoin !== undefined ||
      strokeCap !== undefined ||
      strokeMiter !== undefined ||
      opacity !== undefined ||
      antiAlias !== undefined
    );
  }

  render(parentCtx: DrawingContext) {
    const { invertClip, layer } = this.props;
    const { canvas } = parentCtx;

    const opacity = this.props.opacity
      ? parentCtx.opacity * this.props.opacity
      : parentCtx.opacity;

    const paint = this.paint
      ? this.paint.concat(parentCtx.paint, opacity)
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
          canvas.saveLayer(layer.current ?? undefined);
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

interface PaintChildren {
  shader: SkShader | null;
  colorFilter: SkColorFilter | null;
  imageFilter: SkImageFilter | null;
  maskFilter: SkMaskFilter | null;
  pathEffect: SkPathEffect | null;
}

export class JsiPaintNode
  extends JsiDeclarationNode<PaintProps, SkPaint>
  implements DeclarationNode<PaintProps, SkPaint>
{
  private cache: SkPaint | null = null;

  constructor(Skia: Skia, props: PaintProps = {}) {
    super(Skia, DeclarationType.Paint, NodeType.Paint, props);
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
