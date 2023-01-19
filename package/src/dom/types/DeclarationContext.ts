import type {
  SkShader,
  SkPaint,
  SkImageFilter,
  SkColorFilter,
  SkMaskFilter,
  SkPathEffect,
  Skia,
} from "../../skia/types";

export const composeDeclarations = <T>(
  filters: T[],
  composer: (outer: T, inner: T) => T
) => {
  if (filters.length <= 1) {
    return filters[0];
  }
  return filters.reverse().reduce((inner, outer) => {
    if (!inner) {
      return outer;
    }
    return composer(outer, inner);
  });
};

const popAll = <T>(arr: T[], limit?: number): T[] => {
  const n = limit ?? arr.length;
  return arr.splice(-n);
};

const popAllAsOne = <T>(
  arr: T[],
  composer: (outer: T, inner: T) => T
): T | undefined => {
  const filters = popAll(arr);
  return composeDeclarations(filters, composer);
};

export class DeclarationContext {
  private paints: SkPaint[] = [];
  private imageFilters: SkImageFilter[] = [];
  private colorFilters: SkColorFilter[] = [];
  private maskFilters: SkMaskFilter[] = [];
  private shaders: SkShader[] = [];
  private pathEffects: SkPathEffect[] = [];

  constructor(private Skia: Skia) {}

  pushPathEffect(pathEffect: SkPathEffect) {
    this.pathEffects.push(pathEffect);
  }

  popPathEffect() {
    return this.pathEffects.pop();
  }

  popPathEffects(limit?: number) {
    return popAll(this.pathEffects, limit);
  }

  popPathEffectsAsOne() {
    return popAllAsOne(
      this.pathEffects,
      this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect)
    );
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
    return popAll(this.imageFilters, limit);
  }

  popImageFiltersAsOne() {
    return popAllAsOne(
      this.imageFilters,
      this.Skia.ImageFilter.MakeCompose.bind(this.Skia.ImageFilter)
    );
  }

  pushColorFilter(colorFilter: SkColorFilter) {
    this.colorFilters.push(colorFilter);
  }

  popColorFilter() {
    return this.colorFilters.pop();
  }

  popColorFilters(limit?: number) {
    return popAll(this.colorFilters, limit);
  }

  popColorFiltersAsOne() {
    return popAllAsOne(
      this.colorFilters,
      this.Skia.ColorFilter.MakeCompose.bind(this.Skia.ColorFilter)
    );
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
    return popAll(this.shaders, limit);
  }
}
