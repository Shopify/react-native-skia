import type {
  SkShader,
  SkPaint,
  SkImageFilter,
  SkColorFilter,
  SkMaskFilter,
  SkPathEffect,
} from "../../skia/types";

const pops = <T>(arr: T[], limit?: number): T[] | [] => {
  const n = limit ?? arr.length;
  return arr.splice(-n);
};

export class DeclarationContext {
  private paints: SkPaint[] = [];
  private imageFilters: SkImageFilter[] = [];
  private colorFilters: SkColorFilter[] = [];
  private maskFilters: SkMaskFilter[] = [];
  private shaders: SkShader[] = [];
  private pathEffects: SkPathEffect[] = [];

  pushPathEffect(pathEffect: SkPathEffect) {
    this.pathEffects.push(pathEffect);
  }

  popPathEffect() {
    return this.pathEffects.pop();
  }

  popPathEffects(limit?: number) {
    return pops(this.pathEffects, limit);
  }

  pushPaint(paint: SkPaint) {
    this.paints.push(paint);
  }

  popPaint() {
    return this.paints.pop();
  }

  pushImageFilter(imageFilter: SkImageFilter) {
    this.imageFilters.push(imageFilter);
  }

  popImageFilter() {
    return this.imageFilters.pop();
  }

  popImageFilters(limit?: number) {
    return pops(this.imageFilters, limit);
  }

  pushColorFilter(colorFilter: SkColorFilter) {
    this.colorFilters.push(colorFilter);
  }

  popColorFilter() {
    return this.colorFilters.pop();
  }

  popColorFilters(limit?: number) {
    return pops(this.colorFilters, limit);
  }

  pushMaskFilter(maskFilter: SkMaskFilter) {
    this.maskFilters.push(maskFilter);
  }

  popMaskFilter() {
    return this.maskFilters.pop();
  }

  pushShader(shader: SkShader) {
    this.shaders.push(shader);
  }

  popShader() {
    return this.shaders.pop();
  }

  popShaders(limit?: number) {
    return pops(this.shaders, limit);
  }
}
