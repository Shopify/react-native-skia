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

const popAll = <T>(arr: T[]): T[] => {
  return arr.splice(-arr.length);
};

const popAllAsOne = <T>(
  arr: T[],
  composer: (outer: T, inner: T) => T
): T | undefined => {
  const filters = popAll(arr);
  return composeDeclarations(filters, composer);
};

export class DeclarationContext {
  private _paints: SkPaint[] = [];
  private _imageFilters: SkImageFilter[] = [];
  private _colorFilters: SkColorFilter[] = [];
  private _maskFilters: SkMaskFilter[] = [];
  private _shaders: SkShader[] = [];
  private _pathEffects: SkPathEffect[] = [];

  constructor(private Skia: Skia) {}

  get pathEffects() {
    return this._pathEffects;
  }

  popPathEffectsAsOne() {
    return popAllAsOne(
      this._pathEffects,
      this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect)
    );
  }

  get paints() {
    return this._paints;
  }

  get imageFilters() {
    return this._imageFilters;
  }

  popImageFilters() {
    return popAll(this._imageFilters);
  }

  popImageFiltersAsOne() {
    return popAllAsOne(
      this._imageFilters,
      this.Skia.ImageFilter.MakeCompose.bind(this.Skia.ImageFilter)
    );
  }

  get colorFilters() {
    return this._colorFilters;
  }

  popColorFiltersAsOne() {
    return popAllAsOne(
      this._colorFilters,
      this.Skia.ColorFilter.MakeCompose.bind(this.Skia.ColorFilter)
    );
  }

  get shaders() {
    return this._shaders;
  }

  popShaders() {
    return popAll(this._shaders);
  }

  get maskFilters() {
    return this._maskFilters;
  }
}
