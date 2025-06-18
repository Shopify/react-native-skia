import type { SkJSIInstance } from "./JsiInstance";
export interface SkRSXform extends SkJSIInstance<"RSXform"> {
    readonly scos: number;
    readonly ssin: number;
    readonly tx: number;
    readonly ty: number;
    set(scos: number, ssin: number, tx: number, ty: number): void;
}
