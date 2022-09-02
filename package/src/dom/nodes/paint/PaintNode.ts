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
import type { DeclarationNode, PaintProps } from "../../types";
import { JsiNode } from "../Node";
import { NodeType } from "../../types";
import { enumKey, processColor } from "../datatypes";

export class PaintNode extends JsiNode<PaintProps> {
  private cache: SkPaint | null = null;
  private shader?: DeclarationNode<unknown, SkShader>;
  private maskFilter?: DeclarationNode<unknown, SkMaskFilter>;
  private colorFilter?: DeclarationNode<unknown, SkColorFilter>;
  private imageFilter?: DeclarationNode<unknown, SkImageFilter>;
  private pathEffect?: DeclarationNode<unknown, SkPathEffect>;

  constructor(Skia: Skia, props: PaintProps = {}) {
    super(Skia, NodeType.Paint, props);
  }

  addShader(shader: DeclarationNode<unknown, SkShader>) {
    this.shader = shader;
    this.shader.setInvalidate(() => (this.cache = null));
  }

  addMaskFilter(maskFilter: DeclarationNode<unknown, SkMaskFilter>) {
    this.maskFilter = maskFilter;
    this.maskFilter.setInvalidate(() => (this.cache = null));
  }

  addColorFilter(colorFilter: DeclarationNode<unknown, SkColorFilter>) {
    this.colorFilter = colorFilter;
    this.colorFilter.setInvalidate(() => (this.cache = null));
  }

  addImageFilter(imageFilter: DeclarationNode<unknown, SkImageFilter>) {
    this.imageFilter = imageFilter;
    this.imageFilter.setInvalidate(() => (this.cache = null));
  }

  addPathEffect(pathEffect: DeclarationNode<unknown, SkPathEffect>) {
    this.pathEffect = pathEffect;
    this.pathEffect.setInvalidate(() => (this.cache = null));
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
