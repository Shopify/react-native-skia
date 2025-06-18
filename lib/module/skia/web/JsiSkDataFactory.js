import { Host } from "./Host";
import { JsiSkData } from "./JsiSkData";
export class JsiSkDataFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  fromURI(uri) {
    return fetch(uri).then(response => response.arrayBuffer()).then(data => new JsiSkData(this.CanvasKit, data));
  }
  /**
   * Creates a new Data object from a byte array.
   * @param bytes An array of bytes representing the data
   */
  fromBytes(bytes) {
    return new JsiSkData(this.CanvasKit, bytes);
  }
  /**
   * Creates a new Data object from a base64 encoded string.
   * @param base64 A Base64 encoded string representing the data
   */
  fromBase64(base64) {
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    return this.fromBytes(bytes);
  }
}
//# sourceMappingURL=JsiSkDataFactory.js.map