import type { SkRect } from "@exodus/react-native-skia";

const f = 1;
const width = 3840 * f;
const height = 2160 * f;
export const DEV = process.env.NODE_ENV === "development";
export const CANVAS = { x: 0, y: 0, width, height };
export const CANVAS_SIZE = { width, height };
export const center = { x: width / 2, y: height / 2 };
export const fps = 30;
export const strokeWidth = 10;
export const defaultStroke = {
  strokeWidth,
  style: "stroke",
  strokeJoin: "round",
  strokeCap: "round",
} as const;

export const smallStroke = {
  ...defaultStroke,
  strokeWidth: defaultStroke.strokeWidth / 2,
};

export const largeStroke = {
  ...defaultStroke,
  strokeWidth: defaultStroke.strokeWidth * 2,
};

export const Palette = {
  primary: "#63a1ff",
  secondary: "#60d1b9",
  tertiary: "#FF799A",
  quaternary: "#FFB069",
};

export const Gradients = {
  primary: ["#63a1ff", "#60d1b9"],
  secondary: ["#FF799A", "#ff4774"],
  tertiary: ["#FFE0A5", "#FECA8D"],
};

export const splitScreenVertically = () => {
  const halfWidth = CANVAS.width / 2;
  const left = {
    x: CANVAS.x,
    y: CANVAS.y,
    width: halfWidth,
    height: CANVAS.height,
  };
  const right = {
    x: CANVAS.x + halfWidth,
    y: CANVAS.y,
    width: halfWidth,
    height: CANVAS.height,
  };
  return { left, right };
};

export const splitHorizontal = (rect: SkRect) => {
  const halfHeight = rect.height / 2;
  const top = { x: rect.x, y: rect.y, width: rect.width, height: halfHeight };
  const bottom = {
    x: rect.x,
    y: rect.y + halfHeight,
    width: rect.width,
    height: halfHeight,
  };
  return { top, bottom };
};

export const splitVertical = (rect: SkRect) => {
  const halfWidth = rect.width / 2;
  const left = { x: rect.x, y: rect.y, width: halfWidth, height: rect.height };
  const right = {
    x: rect.x + halfWidth,
    y: rect.y,
    width: halfWidth,
    height: rect.height,
  };
  return { left, right };
};

export const getCenter = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
};

export const getTopHalf = (rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => {
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height / 2 };
};
