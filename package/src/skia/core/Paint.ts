import { Skia } from "../Skia";

export const SkiaPaint = () => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  return paint;
};
