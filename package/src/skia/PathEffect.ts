import type { SkJSIInstance } from "./JsiInstance";

export type IPathEffect = SkJSIInstance<"PathEffect">;

export const isPathEffect = (
  obj: SkJSIInstance<string> | null
): obj is IPathEffect => obj !== null && obj.__typename__ === "PathEffect";

export interface PathEffectFactory {
  /**
   * Returns a PathEffect that can turn sharp corners into rounded corners.
   * @param radius - if <=0, returns null
   */
  MakeCorner(radius: number): IPathEffect | null;

  /**
   * Returns a PathEffect that add dashes to the path.
   *
   * See SkDashPathEffect.h for more details.
   *
   * @param intervals - even number of entries with even indicies specifying the length of
   *                    the "on" intervals, and the odd indices specifying the length of "off".
   * @param phase - offset length into the intervals array. Defaults to 0.
   */
  MakeDash(intervals: number[], phase?: number): IPathEffect;

  /**
   * Returns a PathEffect that breaks path into segments of segLength length, and randomly move
   * the endpoints away from the original path by a maximum of deviation.
   * @param segLength - length of the subsegments.
   * @param dev - limit of the movement of the endpoints.
   * @param seedAssist - modifies the randomness. See SkDiscretePathEffect.h for more.
   */
  MakeDiscrete(segLength: number, dev: number, seedAssist: number): IPathEffect;

  /**
   *
   * A pathEffect whose effect is to apply first the inner pathEffect and the the
   * outer pathEffect (i.e. outer(inner(path))).
   *
   */
  MakeCompose(outer: IPathEffect, inner: IPathEffect): IPathEffect;

  /**
   *
   * A pathEffect pathEffect whose effect is to apply two effects,
   * in sequence (i.e. first(path) + second(path)).
   *
   */
  MakeSum(outer: IPathEffect, inner: IPathEffect): IPathEffect;
}
