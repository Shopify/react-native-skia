export interface SkRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const isRect = (def: unknown): def is SkRect => {
  if (typeof def === "object" && def !== null) {
    const rect = def as SkRect;
    return (
      typeof rect.x === "number" &&
      typeof rect.y === "number" &&
      typeof rect.width === "number" &&
      typeof rect.height === "number"
    );
  }
  return false;
};
