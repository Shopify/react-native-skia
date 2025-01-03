/* eslint-disable @typescript-eslint/no-explicit-any */
export enum DeclarationType {
  ColorFilter,
  ImageFilter,
  Shader,
  MaskFilter,
  PathEffect,
  Paint,
}

interface Filter {
  tag: string;
}

export interface SkColorFilter extends Filter {
  type: DeclarationType.ColorFilter;
}

interface SkImageFilter extends Filter {
  type: DeclarationType.ImageFilter;
}

interface SkShader extends Filter {
  type: DeclarationType.Shader;
}

interface SkMaskFilter extends Filter {
  type: DeclarationType.MaskFilter;
}

interface SkPathEffect extends Filter {
  type: DeclarationType.PathEffect;
}

interface SkPaint extends Filter {
  type: DeclarationType.Paint;
}

type Composer<T> = (outer: T, inner: T) => T;
export const compose: any = <T extends Filter>(outer: T, inner: T) => ({
  tag: `Compose(${outer.tag}, ${inner.tag})`,
});

export const composeDeclarations = <T>(filters: T[], composer: Composer<T>) => {
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

class Declaration<T extends Filter> {
  public decls: T[] = [];
  public indexes = [0];
  public composer?: Composer<T>;

  constructor(composer?: Composer<T>) {
    this.composer = composer;
  }

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
    if (this.decls.length === 0) {
      return undefined;
    }
    if (!this.composer) {
      throw new Error("No composer for this type of declaration");
    }
    const decls = this.popAll();
    return composeDeclarations(decls, this.composer!);
  }
}

export class DeclarationContext {
  readonly paints: Declaration<SkPaint>;
  readonly maskFilters: Declaration<SkMaskFilter>;
  readonly shaders: Declaration<SkShader>;
  readonly pathEffects: Declaration<SkPathEffect>;
  readonly imageFilters: Declaration<SkImageFilter>;
  readonly colorFilters: Declaration<SkColorFilter>;

  constructor() {
    const peComp: Composer<SkPathEffect> = compose;
    const ifComp: Composer<SkImageFilter> = compose;
    const cfComp: Composer<SkColorFilter> = compose;
    this.paints = new Declaration<SkPaint>();
    this.maskFilters = new Declaration<SkMaskFilter>();
    this.shaders = new Declaration<SkShader>();
    this.pathEffects = new Declaration<SkPathEffect>(peComp);
    this.imageFilters = new Declaration<SkImageFilter>(ifComp);
    this.colorFilters = new Declaration<SkColorFilter>(cfComp);
  }

  save() {
    this.paints.save();
    this.maskFilters.save();
    this.shaders.save();
    this.pathEffects.save();
    this.imageFilters.save();
    this.colorFilters.save();
  }

  restore() {
    this.paints.restore();
    this.maskFilters.restore();
    this.shaders.restore();
    this.pathEffects.restore();
    this.imageFilters.restore();
    this.colorFilters.restore();
  }
}
