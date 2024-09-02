import { useEffect, useMemo } from "react";
import type { WorkletFunction } from "react-native-reanimated/lib/typescript/commonTypes";

import type { SkColor, SkHostRect, SkPoint, SkRSXform } from "../../skia/types";
import { Skia } from "../../skia";

import { notifyChange } from "./interpolators";
import Rea from "./ReanimatedProxy";

type Modifier<T> = (input: T, index: number) => void;

const useBufferValue = <T>(size: number, bufferInitializer: () => T) => {
  return useMemo(
    () => Rea.makeMutable(new Array(size).fill(0).map(bufferInitializer)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size]
  );
};

const useBuffer = <T>(
  size: number,
  bufferInitializer: () => T,
  modifier: Modifier<T>
) => {
  const values = useBufferValue(size, bufferInitializer);
  const mod = modifier as WorkletFunction;
  const deps = [size, ...Object.values(mod.__closure ?? {})];
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

export const useRectBuffer = (size: number, modifier: Modifier<SkHostRect>) =>
  useBuffer(size, () => Skia.XYWHRect(0, 0, 0, 0), modifier);

// Usage for RSXform Buffer
export const useRSXformBuffer = (size: number, modifier: Modifier<SkRSXform>) =>
  useBuffer(size, () => Skia.RSXform(1, 0, 0, 0), modifier);

// Usage for Point Buffer
export const usePointBuffer = (size: number, modifier: Modifier<SkPoint>) =>
  useBuffer(size, () => Skia.Point(0, 0), modifier);

// Usage for Color Buffer
export const useColorBuffer = (size: number, modifier: Modifier<SkColor>) =>
  useBuffer(size, () => Skia.Color("black"), modifier);
