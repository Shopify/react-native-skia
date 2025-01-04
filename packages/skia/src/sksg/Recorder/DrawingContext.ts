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

  get paint() {
    return this.paints[this.paints.length - 1];
  }

  restorePaint() {
    this.paints.pop();
  }
}
