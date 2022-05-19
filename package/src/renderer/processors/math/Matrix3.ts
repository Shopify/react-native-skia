import { exhaustiveCheck } from "../../typeddash";
import { Skia } from "../../../skia";

type Transform2dName =
  | "translateX"
  | "translateY"
  | "scale"
  | "skewX"
  | "skewY"
  | "scaleX"
  | "scaleY"
  | "rotateZ"
  | "rotate";

export interface TransformProp {
  transform?: Transforms2d;
}

type Transformations = {
  readonly [Name in Transform2dName]: number;
};
export type Transforms2d = readonly (
  | Pick<Transformations, "translateX">
  | Pick<Transformations, "translateY">
  | Pick<Transformations, "scale">
  | Pick<Transformations, "scaleX">
  | Pick<Transformations, "scaleY">
  | Pick<Transformations, "skewX">
  | Pick<Transformations, "skewY">
  | Pick<Transformations, "rotate">
)[];

export const processTransform2d = (transforms: Transforms2d) =>
  transforms.reduce((acc, transform) => {
    const key = Object.keys(transform)[0] as Transform2dName;
    const value = (transform as Pick<Transformations, typeof key>)[key];
    if (key === "translateX") {
      acc.preTranslate(value, 0);
      return acc;
    }
    if (key === "translateY") {
      acc.preTranslate(0, value);
      return acc;
    }
    if (key === "scale") {
      acc.preScale(value, value);
      return acc;
    }
    if (key === "scaleX") {
      acc.preScale(value, 0);
      return acc;
    }
    if (key === "scaleY") {
      acc.preScale(0, value);
      return acc;
    }
    if (key === "skewX") {
      acc.preSkew(value, 0);
      return acc;
    }
    if (key === "skewY") {
      acc.preSkew(0, value);
      return acc;
    }
    if (key === "rotate" || key === "rotateZ") {
      acc.preRotate((value * 180) / Math.PI);
      return acc;
    }
    return exhaustiveCheck(key);
  }, Skia.Matrix());
