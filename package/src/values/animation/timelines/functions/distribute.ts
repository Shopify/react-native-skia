/* eslint-disable no-nested-ternary */
import type { DistributeParams } from "../types";

import { shuffle } from "./shuffle";

/**
 * @description Distributes values from an array
 * @param params @see DistributeParams
 */
export function distribute<T>(params: number | DistributeParams<T>) {
  // Resolve parameters
  const resolvedParams: DistributeParams<T> =
    typeof params === "number" ? { each: params as number } : params;

  // Validate input
  if (
    resolvedParams.each === undefined &&
    resolvedParams.amount === undefined
  ) {
    throw Error(
      "Distribution needs either the each or amount parameter to be set."
    );
  }

  // resolve starting point
  const base = resolvedParams.base || 0;

  // Resolve from parameters
  let resolvedFrom = 0;
  let fromIsPercentage = false;
  let isRandom = false;
  let percentageX = 0.0;
  let percentageY = 0.0;

  if (typeof resolvedParams.from === "number") {
    // From can either be a number indicating the index or
    // a progress between 0..1
    if (resolvedParams.from >= 0 && resolvedParams.from <= 1) {
      // We have a percentage 0..1
      fromIsPercentage = true;
      percentageX = resolvedParams.from as number;
      percentageY = resolvedParams.from as number;
    } else {
      // Index
      resolvedFrom = resolvedParams.from as number;
    }
  } else if (resolvedParams.from instanceof Array) {
    // We have an array - these are percentages of the x & y axis
    percentageX = resolvedParams.from[1];
    percentageY = resolvedParams.from[0];
    fromIsPercentage = true;
  } else if (typeof resolvedParams.from === "string") {
    // From will be percentages
    fromIsPercentage = true;
    // We have a constant for from
    if (resolvedParams.from === "center") {
      percentageX = 0.5;
      percentageY = 0.5;
    } else if (resolvedParams.from === "edges") {
      percentageX = 0.5;
      percentageY = 0.5;
    } else if (resolvedParams.from === "end") {
      percentageX = 1.0;
      percentageY = 1.0;
    } else if (resolvedParams.from === "random") {
      // Shuffle!
      isRandom = true;
    }
  }

  // Now comes the grid
  const resolvedGrid = resolvedParams.grid || [1, Number.MAX_VALUE];

  // Save distance values
  const values: {
    [key: number]: {
      min: number;
      max: number;
      value: number;
      base: number;
      distances: Array<number>;
    };
  } = {};

  const easing = resolvedParams.easing || ((t: number) => t);

  /**
   * Function for calculating distances (distances can be cached)
   */
  const calculateDistances = (arr: T[]) => {
    // Check if we have a cached copy
    if (values[arr.length]) {
      return values[arr.length];
    }
    // Set up distances
    const value = {
      min: 0,
      max: 0,
      value: 0,
      base: 0,
      // eslint-disable-next-line no-array-constructor
      distances: new Array<number>(),
    };
    values[arr.length] = value;
    let { length } = arr;
    const wrapColumn = resolvedGrid[1];

    // Resolve grids
    const gridX = fromIsPercentage
      ? Math.min(wrapColumn, length) * percentageX - 0.5
      : resolvedFrom % wrapColumn;
    const gridY = fromIsPercentage
      ? (length * percentageY) / wrapColumn - 0.5
      : resolvedFrom / wrapColumn || 0;

    let max = 0;
    let min = Number.MAX_VALUE;

    for (let j = 0; j < length; j++) {
      const x = (j % wrapColumn) - gridX;
      const y = gridY - (j / wrapColumn || 0);
      const distance = !resolvedParams.axis
        ? Math.sqrt(x * x + y * y)
        : Math.abs(resolvedParams.axis === "y" ? y : x);
      value.distances.push(distance);
      if (distance > max) {
        max = distance;
      }
      if (distance < min) {
        min = distance;
      }
    }
    // Shuffle
    if (isRandom) {
      value.distances = shuffle(value.distances);
    }
    value.max = max - min;
    value.min = min;
    if (resolvedParams.each !== undefined) {
      length =
        (resolvedParams.each *
          (wrapColumn > length
            ? length - 1
            : !resolvedParams.axis
            ? Math.max(wrapColumn, length / wrapColumn)
            : resolvedParams.axis === "y"
            ? length / wrapColumn
            : wrapColumn) || 0) * (resolvedParams.from === "edges" ? -1 : 1);
    } else if (resolvedParams.amount !== undefined) {
      length =
        resolvedParams.amount * (resolvedParams.from === "edges" ? -1 : 1);
    }

    value.value = length;
    value.base = length < 0 ? base - length : base;
    // TODO
    // if (length < 0) {
    //   easing = (t) => 1 - easing(1 - t);
    // }
    return value;
  };

  /**
   * Create function for distribution
   */
  return (index: number, _: T, arr: T[]) => {
    const value = calculateDistances(arr);
    const length = (value.distances[index] - value.min) / value.max || 0;
    return Math.round(value.base + easing(length) * value.value);
  };
}
