export class JsiSkColorFilterFactory extends Host {
    MakeMatrix(cMatrix: any): JsiSkColorFilter;
    MakeBlend(color: any, mode: any): JsiSkColorFilter;
    MakeCompose(outer: any, inner: any): JsiSkColorFilter;
    MakeLerp(t: any, dst: any, src: any): JsiSkColorFilter;
    MakeLinearToSRGBGamma(): JsiSkColorFilter;
    MakeSRGBToLinearGamma(): JsiSkColorFilter;
    MakeLumaColorFilter(): JsiSkColorFilter;
}
import { Host } from "./Host";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
