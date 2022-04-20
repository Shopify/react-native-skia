/* eslint-disable camelcase */
import type { Vector } from "@shopify/react-native-skia";
import { cartesian2Polar, Skia } from "@shopify/react-native-skia";
import { exhaustiveCheck } from "@shopify/react-native-skia/src/renderer/typeddash";
import { Dimensions } from "react-native";

import data from "./data.json";

export const SIZE = Dimensions.get("window").width;
export const PADDING = 8;

interface Amount {
  amount: string;
  currency: string;
  scale: string;
}

interface PercentChange {
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
}

interface LatestPrice {
  amount: Amount;
  timestamp: string;
  percent_change: PercentChange;
}

type PriceList = [string, number][];

interface DataPoints {
  percent_change: number;
  prices: PriceList;
}

interface Prices {
  latest: string;
  latest_price: LatestPrice;
  hour: DataPoints;
  day: DataPoints;
  week: DataPoints;
  month: DataPoints;
  year: DataPoints;
  all: DataPoints;
}

const values = data.data.prices as Prices;
const POINTS = 60;

const controlPoint = (
  current: Vector,
  previous: Vector,
  next: Vector,
  reverse: boolean,
  smoothing: number
) => {
  "worklet";
  const p = previous || current;
  const n = next || current;
  // Properties of the opposed-line
  const lengthX = n.x - p.x;
  const lengthY = n.y - p.y;

  const o = cartesian2Polar({ x: lengthX, y: lengthY });
  // If is end-control-point, add PI to the angle to go backward
  const angle = o.theta + (reverse ? Math.PI : 0);
  const length = o.radius * smoothing;
  // The control point position is relative to the current point
  const x = current.x + Math.cos(angle) * length;
  const y = current.y + Math.sin(angle) * length;
  return { x, y };
};

export const curveLines = (
  points: Vector[],
  smoothing: number,
  strategy: "complex" | "bezier" | "simple"
) => {
  "worklet";
  const path = Skia.Path.Make();
  path.moveTo(points[0].x, points[0].y);
  // build the d attributes by looping over the points
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      continue;
    }
    const point = points[i];
    const next = points[i + 1];
    const prev = points[i - 1];
    const cps = controlPoint(prev, points[i - 2], point, false, smoothing);
    const cpe = controlPoint(point, prev, next, true, smoothing);
    switch (strategy) {
      case "simple":
        const cp = {
          x: (cps.x + cpe.x) / 2,
          y: (cps.y + cpe.y) / 2,
        };
        path.quadTo(cp.x, cp.y, point.x, point.y);
        break;
      case "bezier":
        const p0 = points[i - 2] || prev;
        const p1 = points[i - 1];
        const cp1x = (2 * p0.x + p1.x) / 3;
        const cp1y = (2 * p0.y + p1.y) / 3;
        const cp2x = (p0.x + 2 * p1.x) / 3;
        const cp2y = (p0.y + 2 * p1.y) / 3;
        const cp3x = (p0.x + 4 * p1.x + point.x) / 6;
        const cp3y = (p0.y + 4 * p1.y + point.y) / 6;
        path.cubicTo(cp1x, cp1y, cp2x, cp2y, cp3x, cp3y);
        if (i === points.length - 1) {
          path.cubicTo(
            points[points.length - 1].x,
            points[points.length - 1].y,
            points[points.length - 1].x,
            points[points.length - 1].y,
            points[points.length - 1].x,
            points[points.length - 1].y
          );
        }
        break;
      case "complex":
        path.cubicTo(cps.x, cps.y, cpe.x, cpe.y, point.x, point.y);
        break;
      default:
        exhaustiveCheck(strategy);
    }
  }
  return path;
};

const buildGraph = (datapoints: DataPoints, label: string) => {
  const priceList = datapoints.prices.slice(0, POINTS);
  const formattedValues = priceList.map(
    (price) => [parseFloat(price[0]), price[1]] as [number, number]
  );
  const prices = formattedValues.map((value) => value[0]);
  const dates = formattedValues.map((value) => value[1]);
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const AJUSTED_SIZE = SIZE - PADDING * 2;
  const points = formattedValues.map(([price, date]) => {
    const x = ((date - minDate) / (maxDate - minDate)) * SIZE;
    const y = ((price - minPrice) / (maxPrice - minPrice)) * AJUSTED_SIZE;
    return { x, y };
  });
  const path = curveLines(points, 0.1, "complex");

  return {
    label,
    minPrice,
    maxPrice,
    percentChange: datapoints.percent_change,
    path,
  };
};

export const graphs = [
  {
    label: "1H",
    value: 0,
    data: buildGraph(values.hour, "Last Hour"),
  },
  {
    label: "1D",
    value: 1,
    data: buildGraph(values.day, "Today"),
  },
  {
    label: "1M",
    value: 2,
    data: buildGraph(values.month, "Last Month"),
  },
  {
    label: "1Y",
    value: 3,
    data: buildGraph(values.year, "This Year"),
  },
  {
    label: "all",
    value: 4,
    data: buildGraph(values.all, "All time"),
  },
] as const;

export type GraphIndex = 0 | 1 | 2 | 3 | 4;
