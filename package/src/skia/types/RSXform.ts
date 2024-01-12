import type { SkJSIInstance } from "./JsiInstance";

export interface SkRSXform extends SkJSIInstance<"RSXform"> {
  readonly scos: number;
  readonly ssin: number;
  readonly tx: number;
  readonly ty: number;
}
