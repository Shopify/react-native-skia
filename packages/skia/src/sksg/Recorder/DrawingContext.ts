"worklet";

import type {
  Skia,
  SkCanvas,
  SkColorFilter,
  SkPaint,
  SkShader,
  SkImageFilter,
} from "../../skia/types";

export class DrawingContext {
  Skia: Skia;
  canvas: SkCanvas;
  paints: SkPaint[] = [];
  colorFilters: SkColorFilter[] = [];
  shaders: SkShader[] = [];
  imageFilters: SkImageFilter[] = [];

  constructor(Skia: Skia, canvas: SkCanvas) {
    this.Skia = Skia;
    this.canvas = canvas;
    this.paints.push(Skia.Paint());
  }

  savePaint() {
    this.paints.push(this.paint.copy());
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
    this.paints.pop();
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
    this.colorFilters = [];
    this.shaders = [];
    this.imageFilters = [];
  }
}
