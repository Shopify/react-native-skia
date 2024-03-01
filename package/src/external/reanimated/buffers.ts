import { useEffect, useMemo } from "react";
import type { WorkletFunction } from "react-native-reanimated/lib/typescript/reanimated2/commonTypes";

import type { SkColor, SkHostRect, SkPoint, SkRSXform } from "../../skia/types";
import { Skia } from "../../skia";

import { startMapper, stopMapper, useSharedValue } from "./moduleWrapper";
import { notifyChange } from "./interpolators";

type Modifier<T> = (input: T, index: number) => void;

const useBuffer = <T>(
  size: number,
  bufferInitializer: () => T,
  modifier: Modifier<T>
) => {
  const buffer = useMemo(
    () => new Array(size).fill(0).map(bufferInitializer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size]
  );
  const values = useSharedValue(buffer);
  const mod = modifier as WorkletFunction;
  const deps = Object.values(mod.__closure ?? {});
  const mapperId = startMapper(() => {
    "worklet";
    buffer.forEach((val, index) => {
      modifier(val, index);
    });
    notifyChange(values);
  }, deps);

  useEffect(() => {
    return () => {
      stopMapper(mapperId);
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
