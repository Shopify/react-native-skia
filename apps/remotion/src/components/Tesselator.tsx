import type {
  Color,
  SkContourMeasure,
  SkPaint,
  SkPath,
  Vector,
} from "@exodus/react-native-skia";
import {
  TileMode,
  interpolateColors,
  dist,
  mix,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  Skia,
} from "@exodus/react-native-skia";

import { getPointAtLength } from "./math";

export interface Line {
  p1: Vector;
  p2: Vector;
  length: number;
  paint: SkPaint;
}

const basePaint = Skia.Paint();
basePaint.setStrokeWidth(100);
basePaint.setStyle(PaintStyle.Stroke);
basePaint.setStrokeJoin(StrokeJoin.Round);
basePaint.setStrokeCap(StrokeCap.Round);

interface TessalateState {
  contour: SkContourMeasure;
  lines: Line[];
  totalLength: number;
  inputRange: number[];
  colors: Color[];
  tolerance: number;
}

const tessalate = (
  t0: number,
  t1: number,
  p0: Vector,
  p1: Vector,
  length: number,
  state: TessalateState
) => {
  const { lines, totalLength, inputRange, colors, contour, tolerance } = state;
  const t05 = mix(0.5, t0, t1);
  const c05 = contour.getPosTan(t05)[0];
  const d = dist(p0, p1);
  const p05 = getPointAtLength(0.5 * dist(p0, p1), p0, p1);
  if (dist(c05, p05) > tolerance) {
    tessalate(t0, t05, p0, c05, length, state);
    tessalate(t05, t1, c05, p1, t05, state);
  } else {
    const paint = basePaint.copy();
    const start = interpolateColors(length / totalLength, inputRange, colors);
    const end = interpolateColors(
      (length + d) / totalLength,
      inputRange,
      colors
    );
    paint.setShader(
      Skia.Shader.MakeLinearGradient(
        p0,
        p1,
        [new Float32Array(start), new Float32Array(end)],
        null,
        TileMode.Clamp
      )
    );
    lines.push({ p1: p0, p2: p1, length, paint });
  }
};

export const gradientAlongPath = (
  path: SkPath,
  colors: Color[],
  tolerance = 1
) => {
  const inputRange = colors.map((_, i) => i / (colors.length - 1));
  const contourIter = Skia.ContourMeasureIter(path, false, 0.33);
  let length = 0;
  let it: SkContourMeasure | null;
  const contours: SkContourMeasure[] = [];
  while ((it = contourIter.next())) {
    length += it.length();
    contours.push(it);
  }
  const lines: Line[] = [];
  contours.forEach((contour) => {
    const p0 = contour.getPosTan(0)[0];
    const p1 = contour.getPosTan(contour.length())[0];
    tessalate(0, contour.length(), p0, p1, 0, {
      contour,
      lines,
      totalLength: length,
      inputRange,
      colors,
      tolerance,
    });
  });
  return { lines, length, path, contour: contours[0] };
};

interface GradientAlongPathProps {
  path: SkPath;
  length: number;
  lines: Line[];
  start: number;
  end: number;
}

export const GradientAlongPath = ({
  //lines,
  length: totalLength,
  start,
  end,
}: GradientAlongPathProps) => {
  const from = start * totalLength;
  const to = end * totalLength;
  console.log(from, to);
  return null;
  //return (
  // <Drawing
  //   drawing={({ canvas }) => {
  //     lines.map(({ p1, p2, length, paint }) => {
  //       const d = dist(p1, p2);
  //       let src = p1;
  //       let dst = p2;
  //       if (length >= to || length + d <= from) {
  //         return;
  //       }
  //       if (length <= from && length + d >= from) {
  //         src = getPointAtLength(from - length, p1, p2);
  //       }
  //       if (length + d >= to && length <= to) {
  //         dst = getPointAtLength(to - length, p1, p2);
  //       }
  //       canvas.drawLine(src.x, src.y, dst.x, dst.y, paint);
  //     });
  //   }}
  // />
  // );
};

GradientAlongPath.defaultProps = {
  start: 0,
  end: 1,
};
