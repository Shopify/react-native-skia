export class JsiSkPathEffectFactory extends Host {
    MakeCorner(radius: any): JsiSkPathEffect | null;
    MakeDash(intervals: any, phase: any): JsiSkPathEffect;
    MakeDiscrete(segLength: any, dev: any, seedAssist: any): JsiSkPathEffect;
    MakeCompose(_outer: any, _inner: any): jest.Mock<any, any, any>;
    MakeSum(_outer: any, _inner: any): jest.Mock<any, any, any>;
    MakeLine2D(width: any, matrix: any): JsiSkPathEffect | null;
    MakePath1D(path: any, advance: any, phase: any, style: any): JsiSkPathEffect | null;
    MakePath2D(matrix: any, path: any): JsiSkPathEffect | null;
}
import { Host } from "./Host";
import { JsiSkPathEffect } from "./JsiSkPathEffect";
