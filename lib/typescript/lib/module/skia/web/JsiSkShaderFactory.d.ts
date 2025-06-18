export class JsiSkShaderFactory extends Host {
    MakeLinearGradient(start: any, end: any, colors: any, pos: any, mode: any, localMatrix: any, flags: any): JsiSkShader;
    MakeRadialGradient(center: any, radius: any, colors: any, pos: any, mode: any, localMatrix: any, flags: any): JsiSkShader;
    MakeTwoPointConicalGradient(start: any, startRadius: any, end: any, endRadius: any, colors: any, pos: any, mode: any, localMatrix: any, flags: any): JsiSkShader;
    MakeSweepGradient(cx: any, cy: any, colors: any, pos: any, mode: any, localMatrix: any, flags: any, startAngleInDegrees: any, endAngleInDegrees: any): JsiSkShader;
    MakeTurbulence(baseFreqX: any, baseFreqY: any, octaves: any, seed: any, tileW: any, tileH: any): JsiSkShader;
    MakeFractalNoise(baseFreqX: any, baseFreqY: any, octaves: any, seed: any, tileW: any, tileH: any): JsiSkShader;
    MakeBlend(mode: any, one: any, two: any): JsiSkShader;
    MakeColor(color: any): JsiSkShader;
}
import { Host } from "./Host";
import { JsiSkShader } from "./JsiSkShader";
