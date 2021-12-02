export const lerp = (value: number, x: number, y: number) =>
  x * (1 - value) + y * value;
