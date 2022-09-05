import type {
  Skia,
  SkPaint,
  SkMaskFilter,
  SkColorFilter,
} from "../../../skia/types";
import {
  BlendMode,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
} from "../../../skia/types";
import type { SkShader } from "../../../skia/types/Shader/Shader";
import type { SkPathEffect } from "../../../skia/types/PathEffect";
import type { SkImageFilter } from "../../../skia/types/ImageFilter/ImageFilter";
import type { DeclarationNode, PaintNode, PaintProps } from "../../types";
import { NodeKind, NodeType } from "../../types";
import { JsiNode } from "../Node";
import { enumKey, processColor } from "../datatypes";

export class JsiPaintNode extends JsiNode<PaintProps> implements PaintNode {
  private cache: SkPaint | null = null;
  private shader?: DeclarationNode<unknown, SkShader>;
  private maskFilter?: DeclarationNode<unknown, SkMaskFilter>;
  private colorFilter?: DeclarationNode<unknown, SkColorFilter>;
  private imageFilter?: DeclarationNode<unknown, SkImageFilter>;
  private pathEffect?: DeclarationNode<unknown, SkPathEffect>;

  constructor(Skia: Skia, props: PaintProps = {}) {
    super(Skia, NodeKind.Paint, NodeType.Paint, props);
  }

  setProps(props: PaintProps) {
    this.props = props;
    this.cache = null;
  }

  setProp<K extends keyof PaintProps>(name: K, v: PaintProps[K]) {
    this.props[name] = v;
    this.cache = null;
  }

  addShader(shader: DeclarationNode<unknown, SkShader>) {
    this.shader = shader;
    this.shader.setInvalidate(() => (this.cache = null));
  }

  removeShader() {
    this.shader = undefined;
    this.cache = null;
  }

  getShader() {
    return this.shader;
  }

  addMaskFilter(maskFilter: DeclarationNode<unknown, SkMaskFilter>) {
    this.maskFilter = maskFilter;
    this.maskFilter.setInvalidate(() => (this.cache = null));
  }

  removeMaskFilter() {
    this.maskFilter = undefined;
    this.cache = null;
  }

  getMaskFilter() {
    return this.maskFilter;
  }

  addColorFilter(colorFilter: DeclarationNode<unknown, SkColorFilter>) {
    this.colorFilter = colorFilter;
    this.colorFilter.setInvalidate(() => (this.cache = null));
  }

  removeColorFilter() {
    this.colorFilter = undefined;
    this.cache = null;
  }

  getColorFilter() {
    return this.colorFilter;
  }

  addImageFilter(imageFilter: DeclarationNode<unknown, SkImageFilter>) {
    this.imageFilter = imageFilter;
    this.imageFilter.setInvalidate(() => (this.cache = null));
  }

  removeImageFilter() {
    this.imageFilter = undefined;
    this.cache = null;
  }

  getImageFilter() {
    return this.imageFilter;
  }

  addPathEffect(pathEffect: DeclarationNode<unknown, SkPathEffect>) {
    this.pathEffect = pathEffect;
    this.pathEffect.setInvalidate(() => (this.cache = null));
  }

  removePathEffect() {
    this.pathEffect = undefined;
    this.cache = null;
  }

  getPathEffect() {
    return this.pathEffect;
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
    const paint = parentPaint.copy();
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
    // Children
    if (this.shader !== undefined) {
      paint.setShader(this.shader.get());
    }
    if (this.maskFilter !== undefined) {
      paint.setMaskFilter(this.maskFilter.get());
    }
    if (this.pathEffect !== undefined) {
      paint.setPathEffect(this.pathEffect.get());
    }
    if (this.imageFilter !== undefined) {
      paint.setImageFilter(this.imageFilter.get());
    }
    if (this.colorFilter !== undefined) {
      paint.setColorFilter(this.colorFilter.get());
    }
    this.cache = paint;
    return paint;
  }
}
