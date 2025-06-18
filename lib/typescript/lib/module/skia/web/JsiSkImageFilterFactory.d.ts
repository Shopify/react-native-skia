export class JsiSkImageFilterFactory extends Host {
    MakeOffset(dx: any, dy: any, input: any): JsiSkImageFilter;
    MakeDisplacementMap(channelX: any, channelY: any, scale: any, in1: any, input: any): JsiSkImageFilter;
    MakeShader(shader: any, _input: any): JsiSkImageFilter;
    MakeBlur(sigmaX: any, sigmaY: any, mode: any, input: any): JsiSkImageFilter;
    MakeColorFilter(cf: any, input: any): JsiSkImageFilter;
    MakeCompose(outer: any, inner: any): JsiSkImageFilter;
    MakeDropShadow(dx: any, dy: any, sigmaX: any, sigmaY: any, color: any, input: any, cropRect: any): JsiSkImageFilter;
    MakeDropShadowOnly(dx: any, dy: any, sigmaX: any, sigmaY: any, color: any, input: any, cropRect: any): JsiSkImageFilter;
    MakeErode(rx: any, ry: any, input: any, cropRect: any): JsiSkImageFilter;
    MakeDilate(rx: any, ry: any, input: any, cropRect: any): JsiSkImageFilter;
    MakeBlend(mode: any, background: any, foreground: any, cropRect: any): JsiSkImageFilter;
    MakeRuntimeShader(_builder: any, _childShaderName: any, _input: any): jest.Mock<any, any, any>;
}
import { Host } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
