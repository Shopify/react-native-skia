import type {
  SkShader,
  SkPaint,
  SkImageFilter,
  SkColorFilter,
  SkMaskFilter,
} from "../../skia/types";

export class DeclarationContext {
  private paints: SkPaint[] = [];
  private imageFilter: SkImageFilter[] = [];
  private colorFilter: SkColorFilter[] = [];
  private maskFilter: SkMaskFilter[] = [];
  private shader: SkShader[] = [];

  pushPaint(paint: SkPaint) {
    this.paints.push(paint);
  }

  popPaint() {
    return this.paints.pop();
  }

  pushImageFilter(imageFilter: SkImageFilter) {
    this.imageFilter.push(imageFilter);
  }

  popImageFilter() {
    return this.imageFilter.pop();
  }

  pushColorFilter(colorFilter: SkColorFilter) {
    this.colorFilter.push(colorFilter);
  }

  popColorFilter() {
    return this.colorFilter.pop();
  }

  pushMaskFilter(maskFilter: SkMaskFilter) {
    this.maskFilter.push(maskFilter);
  }

  popMaskFilter() {
    return this.maskFilter.pop();
  }

  pushShader(shader: SkShader) {
    this.shader.push(shader);
  }

  popShader() {
    return this.shader.pop();
  }
}
