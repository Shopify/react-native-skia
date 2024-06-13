import type { Surface, TextureSource, Image } from "canvaskit-wasm";

import { CanvasKitWebGLBuffer } from "../types";

export class CanvasKitWebGLBufferImpl extends CanvasKitWebGLBuffer {
  public image: Image | null = null;

  constructor(public surface: Surface, private source: TextureSource) {
    super();
  }

  toImage() {
    if (this.image === null) {
      this.image = this.surface.makeImageFromTextureSource(this.source);
    }
    if (this.image === null) {
      throw new Error("Failed to create image from texture source");
    }
    this.surface.updateTextureFromSource(this.image, this.source);
    return this.image;
  }
}
