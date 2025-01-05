"worklet";

import type {
  Skia,
  SkCanvas,
  SkColorFilter,
  SkPaint,
  SkShader,
  SkImageFilter,
  SkPathEffect,
} from "../../skia/types";

export class DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paints: SkPaint[] = [];
  colorFilters: SkColorFilter[] = [];
  shaders: SkShader[] = [];
  imageFilters: SkImageFilter[] = [];
  pathEffects: SkPathEffect[] = [];
  paintDeclarations: SkPaint[] = [];
  paintPool: SkPaint[] = [];
  nextPaintIndex = 1;

  constructor(Skia: Skia, paintPool: SkPaint[], canvas: SkCanvas) {
    this.Skia = Skia;
    this.canvas = canvas;
    paintPool[0] = this.Skia.Paint();
    this.paints.push(paintPool[0]);
    this.paintPool = paintPool;
  }

  savePaint() {
    // Get next available paint from pool or create new one if needed
    if (this.nextPaintIndex >= this.paintPool.length) {
      this.paintPool.push(this.Skia.Paint());
    }

    const nextPaint = this.paintPool[this.nextPaintIndex];
    nextPaint.assign(this.paint); // Reuse allocation by copying properties
    this.paints.push(nextPaint);
    this.nextPaintIndex++;
  }

  saveBackdropFilter() {
    let imageFilter: SkImageFilter | null = null;
    const imgf = this.imageFilters.pop();
    if (imgf) {
      imageFilter = imgf;
    } else {
      const cf = this.colorFilters.pop();
      if (cf) {
        imageFilter = this.Skia.ImageFilter.MakeColorFilter(cf, null);
      }
    }
    this.canvas.saveLayer(undefined, null, imageFilter);
    this.canvas.restore();
  }

  get paint() {
    return this.paints[this.paints.length - 1];
  }

  restorePaint() {
    return this.paints.pop();
  }

  materializePaint() {
    // Color Filters
    if (this.colorFilters.length > 0) {
      this.paint.setColorFilter(
        this.colorFilters.reduceRight((inner, outer) =>
          inner ? this.Skia.ColorFilter.MakeCompose(outer, inner) : outer
        )
      );
    }
    // Shaders
    if (this.shaders.length > 0) {
      this.paint.setShader(this.shaders[this.shaders.length - 1]);
    }
    // Image Filters
    if (this.imageFilters.length > 0) {
      this.paint.setImageFilter(
        this.imageFilters.reduceRight((inner, outer) =>
          inner ? this.Skia.ImageFilter.MakeCompose(outer, inner) : outer
        )
      );
    }
    // Path Effects
    if (this.pathEffects.length > 0) {
      this.paint.setPathEffect(
        this.pathEffects.reduceRight((inner, outer) =>
          inner ? this.Skia.PathEffect.MakeCompose(outer, inner) : outer
        )
      );
    }
    this.colorFilters = [];
    this.shaders = [];
    this.imageFilters = [];
    this.pathEffects = [];
  }
}
