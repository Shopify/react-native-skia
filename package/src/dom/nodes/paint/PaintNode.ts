import { processColor } from "../../../renderer/processors/Color";
import type {
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  BlendMode,
  SkColor,
  SkPaint,
  Skia,
  SkMaskFilter,
} from "../../../skia/types";
import type { DeclarationNode } from "../Node";
import { NodeType, Node } from "../Node";
import type { SkShader } from "../../../skia/types/Shader/Shader";

export interface PaintNodeProps {
  color?: SkColor;
  strokeWidth?: number;
  blendMode?: BlendMode;
  style?: PaintStyle;
  strokeJoin?: StrokeJoin;
  strokeCap?: StrokeCap;
  strokeMiter?: number;
  opacity?: number;
  antiAlias?: boolean;
}

export class PaintNode extends Node<PaintNodeProps> {
  private cache: SkPaint | null = null;
  private shader?: DeclarationNode<unknown, SkShader>;
  private maskFilter?: DeclarationNode<unknown, SkMaskFilter>;

  constructor(props: PaintNodeProps = {}) {
    super(NodeType.Paint, props);
  }

  addShader(shader: DeclarationNode<unknown, SkShader>) {
    this.shader = shader;
    this.shader.setInvalidate(() => (this.cache = null));
  }

  addMaskFilter(maskFilter: DeclarationNode<unknown, SkMaskFilter>) {
    this.maskFilter = maskFilter;
    this.maskFilter.setInvalidate(() => (this.cache = null));
  }

  concat(Skia: Skia, parentPaint: SkPaint, currentOpacity: number) {
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
      const c = processColor(Skia, color, currentOpacity);
      paint.setShader(null);
      paint.setColor(c);
    } else {
      const c = processColor(Skia, paint.getColor(), currentOpacity);
      paint.setColor(c);
    }
    if (blendMode !== undefined) {
      paint.setBlendMode(blendMode);
    }
    if (style !== undefined) {
      paint.setStyle(style);
    }
    if (strokeJoin !== undefined) {
      paint.setStrokeJoin(strokeJoin);
    }
    if (strokeCap !== undefined) {
      paint.setStrokeCap(strokeCap);
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
      paint.setShader(this.shader.get(Skia));
    }
    if (this.maskFilter !== undefined) {
      paint.setMaskFilter(this.maskFilter.get(Skia));
    }
    this.cache = paint;
    return paint;
  }
}
