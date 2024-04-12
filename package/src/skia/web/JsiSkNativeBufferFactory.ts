import type { CanvasKit } from "canvaskit-wasm";

import type { PlatformBuffer, NativeBufferFactory, SkImage } from "../types";

import { Host, NotImplementedOnRNWeb } from "./Host";

export class JsiSkNativeBufferFactory
  extends Host
  implements NativeBufferFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeFromImage(_image: SkImage): PlatformBuffer {
    throw new NotImplementedOnRNWeb();
  }

  Release(_platformBuffer: PlatformBuffer) {
    throw new NotImplementedOnRNWeb();
  }
}
