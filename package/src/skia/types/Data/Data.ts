import type { SkJSIInstance } from "../JsiInstance";

export type SkData = SkJSIInstance<"Data">;

export type DataSource = ReturnType<typeof require> | string | Uint8Array;
