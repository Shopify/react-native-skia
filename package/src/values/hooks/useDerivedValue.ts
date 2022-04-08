import { useMemo } from "react";

import { ValueApi } from "../api";
import { isValue } from "../../renderer/processors";

/**
 * Creates a new derived value - a value that will calculate its value depending
 * on other values.
 * @param cb Callback to calculate new value
 * @param values Dependant values
 * @returns A readonly value
 */
export const useDerivedValue = <R>(cb: () => R, values: unknown[]) =>
  useMemo(
    () => ValueApi.createDerivedValue<R>(cb, values.filter(isValue)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    values
  );
