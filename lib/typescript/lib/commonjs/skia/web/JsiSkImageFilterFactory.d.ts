export const __esModule: boolean;
export class JsiSkImageFilterFactory extends _Host.Host {
    MakeOffset(dx: any, dy: any, input: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeDisplacementMap(channelX: any, channelY: any, scale: any, in1: any, input: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeShader(shader: any, _input: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeBlur(sigmaX: any, sigmaY: any, mode: any, input: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeColorFilter(cf: any, input: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeCompose(outer: any, inner: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeDropShadow(dx: any, dy: any, sigmaX: any, sigmaY: any, color: any, input: any, cropRect: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeDropShadowOnly(dx: any, dy: any, sigmaX: any, sigmaY: any, color: any, input: any, cropRect: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeErode(rx: any, ry: any, input: any, cropRect: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeDilate(rx: any, ry: any, input: any, cropRect: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeBlend(mode: any, background: any, foreground: any, cropRect: any): _JsiSkImageFilter.JsiSkImageFilter;
    MakeRuntimeShader(_builder: any, _childShaderName: any, _input: any): jest.Mock<any, any, any>;
}
import _Host = require("./Host");
import _JsiSkImageFilter = require("./JsiSkImageFilter");
