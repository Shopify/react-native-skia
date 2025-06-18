import { useEffect, useMemo } from "react";
import { Skia } from "../../skia";
import { notifyChange } from "./interpolators";
import Rea from "./ReanimatedProxy";
const useBufferValue = (size, bufferInitializer) => {
  return useMemo(() => Rea.makeMutable(new Array(size).fill(0).map(bufferInitializer)),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [size]);
};
const useBuffer = (size, bufferInitializer, modifier) => {
  var _mod$__closure;
  const values = useBufferValue(size, bufferInitializer);
  const mod = modifier;
  const deps = [size, ...Object.values((_mod$__closure = mod.__closure) !== null && _mod$__closure !== void 0 ? _mod$__closure : {})];
  const mapperId = Rea.startMapper(() => {
    "worklet";

    values.value.forEach((val, index) => {
      modifier(val, index);
    });
    notifyChange(values);
  }, deps);
  useEffect(() => {
    return () => {
      Rea.stopMapper(mapperId);
    };
  }, [mapperId]);
  return values;
};
export const useRectBuffer = (size, modifier) => useBuffer(size, () => Skia.XYWHRect(0, 0, 0, 0), modifier);

// Usage for RSXform Buffer
export const useRSXformBuffer = (size, modifier) => useBuffer(size, () => Skia.RSXform(1, 0, 0, 0), modifier);

// Usage for Point Buffer
export const usePointBuffer = (size, modifier) => useBuffer(size, () => Skia.Point(0, 0), modifier);

// Usage for Color Buffer
export const useColorBuffer = (size, modifier) => useBuffer(size, () => Skia.Color("black"), modifier);
//# sourceMappingURL=buffers.js.map