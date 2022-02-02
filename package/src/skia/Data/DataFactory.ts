import type { Data } from "./Data";

export interface DataFactory {
  /**
   * Creates a new Data object from an Uri, either locally or remotely.
   * @param uri Uri to a valid resource
   */
  fromURI(uri: string): Promise<Data>;
  /**
   * Creates a new Data object from a byte array.
   * @param bytes An array of bytes representing the data
   */
  fromBytes(bytes: Uint8Array): Data;
  /**
   * Creates a new Data object from a base64 encoded string.
   * @param base64 A Base64 encoded string representing the data
   */
  fromBase64(base64: string): Data;
}
