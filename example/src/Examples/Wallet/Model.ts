/* eslint-disable camelcase */
import { Skia } from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import data from "./data.json";

export const SIZE = Dimensions.get("window").width;

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

const buildGraph = (datapoints: DataPoints, label: string) => {
  const priceList = datapoints.prices.slice(0, POINTS);
  const formattedValues = priceList.map(
    (price) => [parseFloat(price[0]), price[1]] as [number, number]
  );
  const prices = formattedValues.map((value) => value[0]);
  const dates = formattedValues.map((value) => value[1]);
  return {
    label,
    minPrice: 0,
    maxPrice: 0,
    percentChange: 0,
    path: Skia.Path.Make(),
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
