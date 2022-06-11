import type { CanvasKit } from "canvaskit-wasm";

import type { SkData } from "../types";
import type { DataFactory } from "../types/Data/DataFactory";

import { Host, NotImplementedOnRNWeb } from "./Host";
import { JsiSkData } from "./JsiSkData";

export class JsiSkDataFactory extends Host implements DataFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  fromURI(uri: string) {
    return fetch(uri)
      .then((response) => response.arrayBuffer())
      .then((data) => new JsiSkData(this.CanvasKit, data));
  }
  /**
   * Creates a new Data object from a byte array.
   * @param bytes An array of bytes representing the data
   */
  fromBytes(bytes: Uint8Array) {
    return new JsiSkData(this.CanvasKit, bytes);
  }
  /**
   * Creates a new Data object from a base64 encoded string.
   * @param base64 A Base64 encoded string representing the data
   */
  fromBase64(_base64: string): SkData {
    throw new NotImplementedOnRNWeb();
  }
}
