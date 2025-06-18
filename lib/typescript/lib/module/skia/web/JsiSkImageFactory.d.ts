export class JsiSkImageFactory extends Host {
    MakeImageFromViewTag(viewTag: any): Promise<null>;
    MakeImageFromNativeBuffer(buffer: any, surface: any, image: any): JsiSkImage;
    MakeImageFromEncoded(encoded: any): JsiSkImage | null;
    MakeImageFromNativeTextureUnstable(): jest.Mock<any, any, any>;
    MakeImage(info: any, data: any, bytesPerRow: any): JsiSkImage | null;
}
import { Host } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
