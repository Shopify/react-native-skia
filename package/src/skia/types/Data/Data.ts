import type { SkJSIInstance } from "../JsiInstance";

export type Data = SkJSIInstance<"Data">;

export type DataSource = ReturnType<typeof require> | string | Uint8Array;
