import type {
  Skia,
  SkCanvas,
  SkColorFilter,
  SkPaint,
  SkShader,
  SkImageFilter,
  SkPathEffect,
} from "../../skia/types";

export const createDrawingContext = (
  Skia: Skia,
  paintPool: SkPaint[],
  canvas: SkCanvas
) => {
  "worklet";

  // State (formerly class fields)
  const paints: SkPaint[] = [];
  const colorFilters: SkColorFilter[] = [];
  const shaders: SkShader[] = [];
  const imageFilters: SkImageFilter[] = [];
  const pathEffects: SkPathEffect[] = [];
  const paintDeclarations: SkPaint[] = [];

  let nextPaintIndex = 1;

  // Initialize first paint
  paintPool[0] = Skia.Paint();
  paints.push(paintPool[0]);

  // Methods (formerly class methods)
  const savePaint = () => {
    // Get next available paint from pool or create new one if needed
    if (nextPaintIndex >= paintPool.length) {
      paintPool.push(Skia.Paint());
    }

    const nextPaint = paintPool[nextPaintIndex];
    nextPaint.assign(getCurrentPaint()); // Reuse allocation by copying properties
    paints.push(nextPaint);
    nextPaintIndex++;
  };

  const saveBackdropFilter = () => {
    let imageFilter: SkImageFilter | null = null;
    const imgf = imageFilters.pop();
    if (imgf) {
      imageFilter = imgf;
    } else {
      const cf = colorFilters.pop();
      if (cf) {
        imageFilter = Skia.ImageFilter.MakeColorFilter(cf, null);
      }
    }
    canvas.saveLayer(undefined, null, imageFilter);
    canvas.restore();
  };

  // Equivalent to the `get paint()` getter in the original class
  const getCurrentPaint = () => {
    return paints[paints.length - 1];
  };

  const restorePaint = () => {
    return paints.pop();
  };

  const materializePaint = () => {
    // Color Filters
    if (colorFilters.length > 0) {
      getCurrentPaint().setColorFilter(
        colorFilters.reduceRight((inner, outer) =>
          inner ? Skia.ColorFilter.MakeCompose(outer, inner) : outer
        )
      );
    }
    // Shaders
    if (shaders.length > 0) {
      getCurrentPaint().setShader(shaders[shaders.length - 1]);
    }
    // Image Filters
    if (imageFilters.length > 0) {
      getCurrentPaint().setImageFilter(
        imageFilters.reduceRight((inner, outer) =>
          inner ? Skia.ImageFilter.MakeCompose(outer, inner) : outer
        )
      );
    }

    // Path Effects
    if (pathEffects.length > 0) {
      getCurrentPaint().setPathEffect(
        pathEffects.reduceRight((inner, outer) =>
          inner ? Skia.PathEffect.MakeCompose(outer, inner) : outer
        )
      );
    }

    // Clear arrays
    colorFilters.length = 0;
    shaders.length = 0;
    imageFilters.length = 0;
    pathEffects.length = 0;
  };

  // Return an object containing the Skia reference, the canvas, and the methods
  return {
    // Public fields
    Skia,
    canvas,
    paints,
    colorFilters,
    shaders,
    imageFilters,
    pathEffects,
    paintDeclarations,
    paintPool,

    // Public methods
    savePaint,
    saveBackdropFilter,
    get paint() {
      return paints[paints.length - 1];
    }, // the "getter" for the current paint
    restorePaint,
    materializePaint,
  };
};

export type DrawingContext = ReturnType<typeof createDrawingContext>;
