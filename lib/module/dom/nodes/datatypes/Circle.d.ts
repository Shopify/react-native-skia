import type { CircleDef, ScalarCircleDef } from "../../types";
export declare const isCircleScalarDef: (def: CircleDef) => def is ScalarCircleDef;
export declare const processCircle: (def: CircleDef) => {
    c: import("../../..").SkPoint;
    r: number;
};
