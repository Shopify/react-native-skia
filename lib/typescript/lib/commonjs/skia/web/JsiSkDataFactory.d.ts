export const __esModule: boolean;
export class JsiSkDataFactory extends _Host.Host {
    fromURI(uri: any): Promise<_JsiSkData.JsiSkData>;
    /**
     * Creates a new Data object from a byte array.
     * @param bytes An array of bytes representing the data
     */
    fromBytes(bytes: any): _JsiSkData.JsiSkData;
    /**
     * Creates a new Data object from a base64 encoded string.
     * @param base64 A Base64 encoded string representing the data
     */
    fromBase64(base64: any): _JsiSkData.JsiSkData;
}
import _Host = require("./Host");
import _JsiSkData = require("./JsiSkData");
