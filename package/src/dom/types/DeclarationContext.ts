import type {
  SkShader,
  SkPaint,
  SkImageFilter,
  SkMaskFilter,
  SkPathEffect,
  Skia,
  SkColorFilter,
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

class Declaration<T> {
  private decls: T[] = [];
  // private index = 0;

  constructor(private composer?: (outer: T, inner: T) => T) {}

  pop() {
    return this.decls.pop();
  }

  push(decl: T) {
    this.decls.push(decl);
  }

  popAll() {
    return this.decls.splice(-this.decls.length);
  }

  popAllAsOne() {
    if (!this.composer) {
      throw new Error("No composer for this type of declaration");
    }
    const decls = this.popAll();
    return composeDeclarations(decls, this.composer!);
  }
}

export class DeclarationContext {
  private _paints = new Declaration<SkPaint>();
  private _maskFilters = new Declaration<SkMaskFilter>();
  private _shaders = new Declaration<SkShader>();
  private _pathEffects: Declaration<SkPathEffect>;
  private _imageFilters: Declaration<SkImageFilter>;
  private _colorFilters: Declaration<SkColorFilter>;

  constructor(private Skia: Skia) {
    this._pathEffects = new Declaration<SkPathEffect>(
      this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect)
    );
    this._imageFilters = new Declaration<SkImageFilter>(
      this.Skia.ImageFilter.MakeCompose.bind(this.Skia.ImageFilter)
    );
    this._colorFilters = new Declaration<SkColorFilter>(
      this.Skia.ColorFilter.MakeCompose.bind(this.Skia.ColorFilter)
    );
  }

  get pathEffects() {
    return this._pathEffects;
  }

  popPathEffectsAsOne() {
    return this._pathEffects.popAllAsOne();
  }

  get paints() {
    return this._paints;
  }

  get imageFilters() {
    return this._imageFilters;
  }

  popImageFilters() {
    return this._imageFilters.popAll();
  }

  popImageFiltersAsOne() {
    return this._imageFilters.popAllAsOne();
  }

  get colorFilters() {
    return this._colorFilters;
  }

  popColorFiltersAsOne() {
    return this._colorFilters.popAllAsOne();
  }

  get shaders() {
    return this._shaders;
  }

  popShaders() {
    return this._shaders.popAll();
  }

  get maskFilters() {
    return this._maskFilters;
  }
}
