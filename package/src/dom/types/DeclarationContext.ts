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
  private indexes = [0];

  constructor(private composer?: (outer: T, inner: T) => T) {}

  private get index() {
    return this.indexes[this.indexes.length - 1];
  }

  save() {
    this.indexes.push(this.decls.length);
  }

  restore() {
    this.indexes.pop();
  }

  pop() {
    return this.decls.pop();
  }

  push(decl: T) {
    this.decls.push(decl);
  }

  popAll() {
    return this.decls.splice(this.index, this.decls.length - this.index);
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
  private _paints: Declaration<SkPaint>;
  private _maskFilters: Declaration<SkMaskFilter>;
  private _shaders: Declaration<SkShader>;
  private _pathEffects: Declaration<SkPathEffect>;
  private _imageFilters: Declaration<SkImageFilter>;
  private _colorFilters: Declaration<SkColorFilter>;

  constructor(private Skia: Skia) {
    const peComp = this.Skia.PathEffect.MakeCompose.bind(this.Skia.PathEffect);
    const ifComp = this.Skia.ImageFilter.MakeCompose.bind(
      this.Skia.ImageFilter
    );
    const cfComp = this.Skia.ColorFilter.MakeCompose.bind(
      this.Skia.ColorFilter
    );
    this._paints = new Declaration<SkPaint>();
    this._maskFilters = new Declaration<SkMaskFilter>();
    this._shaders = new Declaration<SkShader>();
    this._pathEffects = new Declaration<SkPathEffect>(peComp);
    this._imageFilters = new Declaration<SkImageFilter>(ifComp);
    this._colorFilters = new Declaration<SkColorFilter>(cfComp);
  }

  save() {
    this._paints.save();
    this._maskFilters.save();
    this._shaders.save();
    this._pathEffects.save();
    this._imageFilters.save();
    this._colorFilters.save();
  }

  restore() {
    this._paints.restore();
    this._maskFilters.restore();
    this._shaders.restore();
    this._pathEffects.restore();
    this._imageFilters.restore();
    this._colorFilters.restore();
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
