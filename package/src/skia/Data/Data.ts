import { useEffect, useState } from "react";

import type { SkJSIInstance } from "../JsiInstance";
import { Skia } from "../Skia";

export type Data = SkJSIInstance<"Data">;

const resolveAsset = require("react-native/Libraries/Image/resolveAssetSource");

export const useData = <T>(
  source: ReturnType<typeof require>,
  factory: (data: Data) => T
) => {
  const [data, setData] = useState<T | null>(null);
  useEffect(() => {
    const { uri } = resolveAsset(source);
    Skia.Data.fromURI(uri).then((d) => setData(factory(d)));
  }, [factory, source]);
  return data;
};
