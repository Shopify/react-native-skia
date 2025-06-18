import { getEnum, Host, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkMatrix } from "./JsiSkMatrix";
import { JsiSkPath } from "./JsiSkPath";
import { JsiSkPathEffect } from "./JsiSkPathEffect";
export class JsiSkPathEffectFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeCorner(radius) {
    const pe = this.CanvasKit.PathEffect.MakeCorner(radius);
    if (pe === null) {
      return null;
    }
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
  MakeDash(intervals, phase) {
    const pe = this.CanvasKit.PathEffect.MakeDash(intervals, phase);
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
  MakeDiscrete(segLength, dev, seedAssist) {
    const pe = this.CanvasKit.PathEffect.MakeDiscrete(segLength, dev, seedAssist);
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
  MakeCompose(_outer, _inner) {
    return throwNotImplementedOnRNWeb();
  }
  MakeSum(_outer, _inner) {
    return throwNotImplementedOnRNWeb();
  }
  MakeLine2D(width, matrix) {
    const pe = this.CanvasKit.PathEffect.MakeLine2D(width, JsiSkMatrix.fromValue(matrix));
    if (pe === null) {
      return null;
    }
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
  MakePath1D(path, advance, phase, style) {
    const pe = this.CanvasKit.PathEffect.MakePath1D(JsiSkPath.fromValue(path), advance, phase, getEnum(this.CanvasKit, "Path1DEffect", style));
    if (pe === null) {
      return null;
    }
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
  MakePath2D(matrix, path) {
    const pe = this.CanvasKit.PathEffect.MakePath2D(JsiSkMatrix.fromValue(matrix), JsiSkPath.fromValue(path));
    if (pe === null) {
      return null;
    }
    return new JsiSkPathEffect(this.CanvasKit, pe);
  }
}
//# sourceMappingURL=JsiSkPathEffectFactory.js.map