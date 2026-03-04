import type { PaintProps, SkRect, Vector } from "@shopify/react-native-skia";
import { Skia, Path } from "@shopify/react-native-skia";

interface ProgressProps {
  start?: number;
  end?: number;
}

interface PathLineProps extends PaintProps, ProgressProps {
  p1: Vector;
  p2: Vector;
}

export const PathLine2 = ({ p1, p2, ...props }: PathLineProps) => {
  const path = Skia.Path.Line(p1, p2);
  return <Path path={path} style="stroke" {...props} />;
};

interface PathCircleProps extends PaintProps, ProgressProps {
  c: Vector;
  r: number;
}

export const PathCircle2 = ({ c, r, ...props }: PathCircleProps) => {
  const path = Skia.Path.Circle(c.x, c.y, r);
  return <Path path={path} {...props} />;
};

interface PathRectProps extends PaintProps, ProgressProps {
  rect: SkRect;
}

export const PathRect2 = ({ rect, ...props }: PathRectProps) => {
  const path = Skia.Path.Rect(rect);
  return <Path path={path} {...props} />;
};
