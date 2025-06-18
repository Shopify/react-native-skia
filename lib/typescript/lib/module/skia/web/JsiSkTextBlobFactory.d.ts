export class JsiSkTextBlobFactory extends Host {
    MakeFromText(str: any, font: any): JsiSkTextBlob;
    MakeFromGlyphs(glyphs: any, font: any): JsiSkTextBlob;
    MakeFromRSXform(str: any, rsxforms: any, font: any): JsiSkTextBlob;
    MakeFromRSXformGlyphs(glyphs: any, rsxforms: any, font: any): JsiSkTextBlob;
}
import { Host } from "./Host";
import { JsiSkTextBlob } from "./JsiSkTextBlob";
