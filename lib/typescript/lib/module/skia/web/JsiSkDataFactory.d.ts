export class JsiSkDataFactory extends Host {
    fromURI(uri: any): Promise<JsiSkData>;
    /**
     * Creates a new Data object from a byte array.
     * @param bytes An array of bytes representing the data
     */
    fromBytes(bytes: any): JsiSkData;
    /**
     * Creates a new Data object from a base64 encoded string.
     * @param base64 A Base64 encoded string representing the data
     */
    fromBase64(base64: any): JsiSkData;
}
import { Host } from "./Host";
import { JsiSkData } from "./JsiSkData";
