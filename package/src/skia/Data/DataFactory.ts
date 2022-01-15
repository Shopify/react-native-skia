import type { Data } from "./Data";

export interface DataFactory {
  fromURI(uri: string): Promise<Data>;
}
