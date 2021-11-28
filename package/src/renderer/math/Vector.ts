export interface Vector {
  x: number;
  y: number;
}

export const vec = (x = 0, y?: number) => ({ x, y: y ?? x });
export const neg = (a: Vector) => vec(-a.x, -a.y);
export const translate = ({ x, y }: Vector) =>
  [{ translateX: x }, { translateY: y }] as const;
