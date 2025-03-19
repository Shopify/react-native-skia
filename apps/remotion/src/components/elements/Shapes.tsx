import type {
  SkRect,
  Vector,
  SkPath as RNSkPath,
} from "@exodus/react-native-skia";
import {
  DashPathEffect,
  topLeft,
  bottomRight,
  Skia,
  Path,
  LinearGradient,
} from "@exodus/react-native-skia";
import type { Path as SkPath } from "canvaskit-wasm";

import { useOpenTypeFonts } from "../Canvas";
import { Gradients, largeStroke, smallStroke as smallerStroke } from "../Theme";

import { getTextPath } from "./TextReveal";

interface ProgressProps {
  start?: number;
  end?: number;
}

interface Palette {
  0: string;
  1: string;
}

interface Palettes {
  primary: Palette;
  secondary: Palette;
  tertiary: Palette;
}

interface PaintProps {
  fill?: boolean;
  dashed?: boolean;
  strokeWidth?: number;
  smallStroke?: boolean;
  color: keyof Palettes;
  opacity?: number;
}

interface PathShapeProps extends PaintProps, ProgressProps {
  path: RNSkPath;
}

export const PathShape = ({
  path,
  color,
  fill,
  dashed,
  smallStroke,
  ...props
}: PathShapeProps) => {
  const colors = Gradients[color];
  const bounds = path.computeTightBounds();
  const start = topLeft(bounds);
  const end = bottomRight(bounds);
  // eslint-disable-next-line no-nested-ternary
  const paintProps = fill
    ? { strokeWidth: 0 }
    : smallStroke
    ? smallerStroke
    : largeStroke;
  return (
    <Path path={path} {...props} {...paintProps}>
      <LinearGradient colors={colors} start={start} end={end} />
      {dashed && (
        <DashPathEffect
          intervals={[paintProps.strokeWidth * 2, paintProps.strokeWidth * 2]}
        />
      )}
    </Path>
  );
};

interface PathLineProps extends PaintProps, ProgressProps {
  p1: Vector;
  p2: Vector;
}

export const PathLine = ({ p1, p2, ...props }: PathLineProps) => {
  const path = Skia.Path.Make();
  path.moveTo(p1.x, p1.y);
  path.lineTo(p2.x, p2.y);
  return <PathShape path={path} {...props} />;
};

interface PathCircleProps extends PaintProps, ProgressProps {
  c: Vector;
  r: number;
}

export const PathCircle = ({ c, r, ...props }: PathCircleProps) => {
  const path = Skia.Path.Make();
  path.addCircle(c.x, c.y, r);
  return <PathShape path={path} {...props} />;
};

interface PathRectProps extends PaintProps, ProgressProps {
  rect: SkRect;
}

export const PathRect = ({ rect, ...props }: PathRectProps) => {
  const path = Skia.Path.Make();
  path.addRect(rect);
  return <PathShape path={path} {...props} />;
};

interface RRectProps {
  rect: SkRect;
  r?: number;
  tl?: number;
  tr?: number;
  bl?: number;
  br?: number;
}

interface PathRRectProps extends PaintProps, ProgressProps, RRectProps {}

export const roundedRect = ({ rect, tl, r, bl, br, tr }: RRectProps) => {
  // This is due to a bug in RN Skia we need to use CanvasKit directly
  const path = Skia.Path.Make();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathRef = (path as any).ref as SkPath;
  const topLeft1 = tl ?? r ?? 0;
  const topRight = tr ?? r ?? 0;
  const bottomLeft = bl ?? r ?? 0;
  const bottomRight1 = br ?? r ?? 0;
  const rrct = Skia.RRectXY(rect, topLeft1, topLeft1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = (rrct as any).ref as Float32Array;
  const i = 4;
  ref[i + 2] = topRight;
  ref[i + 3] = topRight;
  ref[i + 4] = bottomLeft;
  ref[i + 5] = bottomRight1;
  ref[i + 6] = bottomLeft;
  ref[i + 7] = bottomLeft;
  pathRef.addRRect(ref);
  return path;
};

export const PathRRect = ({
  rect,
  r,
  tl,
  tr,
  bl,
  br,
  ...props
}: PathRRectProps) => {
  const path = roundedRect({ rect, r, tl, tr, bl, br });
  return <Path path={path} {...props} />;
};

interface PathTextProps extends PaintProps {
  text: string;
  font: string;
  fontSize: number;
  x: number;
  y: number;
}

export const PathText = ({
  text,
  font: fontName,
  x,
  y,
  fontSize,
  ...props
}: PathTextProps) => {
  const font = useOpenTypeFonts()[fontName];
  const path = getTextPath({ font, text, fontSize });
  path.offset(x, y);
  return <PathShape path={path} {...props} fill />;
};
