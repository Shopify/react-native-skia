import type { CanvasKit } from "canvaskit-wasm";

import type { NativeBuffer, NativeBufferFactory, SkImage } from "../types";

import { Host, NotImplementedOnRNWeb } from "./Host";

export class JsiSkNativeBufferFactory
  extends Host
  implements NativeBufferFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromImage(_image: SkImage): NativeBuffer {
    throw new NotImplementedOnRNWeb();
  }

  Release(_platformBuffer: NativeBuffer) {
    throw new NotImplementedOnRNWeb();
  }
}
