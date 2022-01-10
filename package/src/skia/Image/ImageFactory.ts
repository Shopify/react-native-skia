import type { Data } from "../Data";

import type { IImage } from "./Image";

export interface ImageFactory {
  MakeFromEncoded: (encoded: Data) => IImage;
}
