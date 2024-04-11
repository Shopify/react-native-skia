import type { CanvasKit } from "canvaskit-wasm";

import type { PlatformBuffer, PlatformBufferFactory, SkImage } from "../types";

import { Host, NotImplementedOnRNWeb } from "./Host";

export class JsiSkPlatformBufferFactory
  extends Host
  implements PlatformBufferFactory
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
