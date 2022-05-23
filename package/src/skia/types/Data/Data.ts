import type { SkJSIInstance } from "../JsiInstance";

export type Data = SkJSIInstance<"Data">;

type Require = number;
export type DataSource = Require | string | Uint8Array;
