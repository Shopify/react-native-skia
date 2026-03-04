import type { CanvasKit, Matrix3x3, Path } from "canvaskit-wasm";

import { PathVerb } from "../types";
import type {
  FillType,
  PathCommand,
  SkMatrix,
  SkPath,
  SkPoint,
  SkRect,
  InputMatrix,
} from "../types";

import { HostObject } from "./Host";
import { JsiSkPoint } from "./JsiSkPoint";
import { JsiSkRect } from "./JsiSkRect";
import { JsiSkMatrix } from "./JsiSkMatrix";

const CommandCount = {
  [PathVerb.Move]: 3,
  [PathVerb.Line]: 3,
  [PathVerb.Quad]: 5,
  [PathVerb.Conic]: 6,
  [PathVerb.Cubic]: 7,
  [PathVerb.Close]: 1,
};

/**
 * SkPath is an immutable representation of a path.
 * Use SkPathBuilder to construct paths, or use the static factory methods on PathFactory.
 */
export class JsiSkPath extends HostObject<Path, "Path"> implements SkPath {
  constructor(CanvasKit: CanvasKit, ref: Path) {
    super(CanvasKit, ref, "Path");
  }

  // Query methods

  countPoints() {
    return this.ref.countPoints();
  }

  computeTightBounds(): SkRect {
    return new JsiSkRect(this.CanvasKit, this.ref.computeTightBounds());
  }

  contains(x: number, y: number) {
    return this.ref.contains(x, y);
  }

  copy() {
    return new JsiSkPath(this.CanvasKit, this.ref.copy());
  }

  equals(other: SkPath) {
    return this.ref.equals(JsiSkPath.fromValue(other));
  }

  getBounds() {
    return new JsiSkRect(this.CanvasKit, this.ref.getBounds());
  }

  getFillType(): FillType {
    return this.ref.getFillType().value;
  }

  getPoint(index: number): SkPoint {
    return new JsiSkPoint(this.CanvasKit, this.ref.getPoint(index));
  }

  isEmpty() {
    return this.ref.isEmpty();
  }

  isVolatile() {
    return this.ref.isVolatile();
  }

  getLastPt() {
    const count = this.ref.countPoints();
    if (count === 0) {
      return { x: 0, y: 0 };
    }
    const pt = this.ref.getPoint(count - 1);
    return { x: pt[0], y: pt[1] };
  }

  toSVGString() {
    return this.ref.toSVGString();
  }

  isInterpolatable(path2: SkPath): boolean {
    return this.CanvasKit.Path.CanInterpolate(
      this.ref,
      JsiSkPath.fromValue(path2)
    );
  }

  interpolate(end: SkPath, weight: number): SkPath | null {
    const path = this.CanvasKit.Path.MakeFromPathInterpolation(
      this.ref,
      JsiSkPath.fromValue(end),
      weight
    );
    if (path === null) {
      return null;
    }
    return new JsiSkPath(this.CanvasKit, path);
  }

  toCmds() {
    const cmds = this.ref.toCmds();
    const result = cmds.reduce<PathCommand[]>((acc, cmd, i) => {
      if (i === 0) {
        acc.push([]);
      }
      const current = acc[acc.length - 1];
      if (current.length === 0) {
        current.push(cmd);
        const length = CommandCount[current[0] as PathVerb];
        if (current.length === length && i !== cmds.length - 1) {
          acc.push([]);
        }
      } else {
        const length = CommandCount[current[0] as PathVerb];
        if (current.length < length) {
          current.push(cmd);
        }
        if (current.length === length && i !== cmds.length - 1) {
          acc.push([]);
        }
      }
      return acc;
    }, []);
    return result;
  }

  // Methods that return new paths (immutable)

  offset(dx: number, dy: number): SkPath {
    const result = this.ref.copy();
    result.offset(dx, dy);
    return new JsiSkPath(this.CanvasKit, result);
  }

  transform(m: InputMatrix): SkPath {
    let matrix =
      m instanceof JsiSkMatrix
        ? Array.from(JsiSkMatrix.fromValue<Matrix3x3>(m))
        : (m as Exclude<InputMatrix, SkMatrix>);
    if (matrix.length === 16) {
      matrix = [
        matrix[0],
        matrix[1],
        matrix[3],
        matrix[4],
        matrix[5],
        matrix[7],
        matrix[12],
        matrix[13],
        matrix[15],
      ];
    } else if (matrix.length !== 9) {
      throw new Error(`Invalid matrix length: ${matrix.length}`);
    }
    const result = this.ref.copy();
    result.transform(matrix);
    return new JsiSkPath(this.CanvasKit, result);
  }
}
