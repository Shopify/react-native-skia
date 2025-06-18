import type { CanvasKit } from "canvaskit-wasm";
import type { SkData } from "../types";
import type { DataFactory } from "../types/Data/DataFactory";
import { Host } from "./Host";
import { JsiSkData } from "./JsiSkData";
export declare class JsiSkDataFactory extends Host implements DataFactory {
    constructor(CanvasKit: CanvasKit);
    fromURI(uri: string): Promise<JsiSkData>;
    /**
     * Creates a new Data object from a byte array.
     * @param bytes An array of bytes representing the data
     */
    fromBytes(bytes: Uint8Array): JsiSkData;
    /**
     * Creates a new Data object from a base64 encoded string.
     * @param base64 A Base64 encoded string representing the data
     */
    fromBase64(base64: string): SkData;
}
