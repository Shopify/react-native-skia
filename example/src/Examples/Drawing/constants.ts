import { Skia, PaintStyle, StrokeCap } from "@shopify/react-native-skia";

export const ColorPalette = [
  "#000000",
  "rgba(218,54,45,1)",
  "rgba(232,124,17,1)",
  "rgba(152,203,58,1)",
  "rgba(53,206,53,1)",
  "rgba(42,215,155,1)",
  "rgba(36,185,195,1)",
  "rgba(59,137,215,1)",
  "rgba(100,100,230,1)",
  "rgba(149,73,224,1)",
  "rgba(183,55,183,1)",
  "rgba(214,92,163,1)",
];

const DefaultPaint = Skia.Paint();
DefaultPaint.setColor(Skia.Color(ColorPalette[1]));
DefaultPaint.setAntiAlias(true);
DefaultPaint.setStrokeWidth(5);
DefaultPaint.setStyle(PaintStyle.Stroke);
DefaultPaint.setStrokeCap(StrokeCap.Round);

export { DefaultPaint };

export const SizeConstants = [1, 2, 4, 8, 10];
