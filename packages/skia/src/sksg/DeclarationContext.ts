"worklet";

import type {
  SkShader,
  SkPaint,
  SkImageFilter,
  SkMaskFilter,
  SkPathEffect,
  Skia,
  SkColorFilter,
} from "../skia/types";

type Composer<T> = (outer: T, inner: T) => T;

export const composeDeclarations = <T>(filters: T[], composer: Composer<T>) => {
  const len = filters.length;
  if (len <= 1) {
    return filters[0];
  }
  return filters.reduceRight((inner, outer) =>
    inner ? composer(outer, inner) : outer
  );
};

const createDeclaration = <T>(composer?: Composer<T>) => {
  const state = {
    decls: [] as T[],
    indexes: [0],
  };

  return {
    save: () => {
      state.indexes.push(state.decls.length);
    },
    restore: () => {
      state.indexes.pop();
    },
    pop: () => state.decls.pop(),
    push: (decl: T) => {
      state.decls.push(decl);
    },
    popAll: () => {
      const idx = state.indexes[state.indexes.length - 1];
      return state.decls.splice(idx, state.decls.length - idx);
    },
    popAllAsOne: () => {
      if (state.decls.length === 0) {
        return undefined;
      }
      if (!composer) {
        throw new Error("No composer for this type of declaration");
      }
      if (!state.decls.length) {
        return undefined;
      }
      if (!composer) {
        throw new Error("No composer for this type of declaration");
      }

      const idx = state.indexes[state.indexes.length - 1];
      const decls = state.decls.splice(idx, state.decls.length - idx);
      return composeDeclarations(decls, composer);
    },
  };
};

export const createDeclarationContext = (Skia: Skia) => {
  const composers = {
    pathEffect: Skia.PathEffect.MakeCompose.bind(Skia.PathEffect),
    imageFilter: Skia.ImageFilter.MakeCompose.bind(Skia.ImageFilter),
    colorFilter: Skia.ColorFilter.MakeCompose.bind(Skia.ColorFilter),
  };
  return {
    Skia,
    paints: createDeclaration<SkPaint>(),
    maskFilters: createDeclaration<SkMaskFilter>(),
    shaders: createDeclaration<SkShader>(),
    pathEffects: createDeclaration<SkPathEffect>(composers.pathEffect),
    imageFilters: createDeclaration<SkImageFilter>(composers.imageFilter),
    colorFilters: createDeclaration<SkColorFilter>(composers.colorFilter),
  };
};

export type DeclarationContext = ReturnType<typeof createDeclarationContext>;
