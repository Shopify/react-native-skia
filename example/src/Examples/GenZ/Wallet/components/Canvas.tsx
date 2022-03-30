import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  mixColors,
  Skia,
  useDerivedValue,
  vec,
} from "@shopify/react-native-skia";

const width = 375;
const height = 812;
export const Typefaces = {
  DMSansRegular: require("../../assets/DM_Sans/DMSans-Regular.ttf"),
  DMSansMedium: require("../../assets/DM_Sans/DMSans-Medium.ttf"),
};

export const CANVAS = {
  width: 375,
  height: 812,
  center: vec(width / 2, height / 2),
};

export const Images = {
  CHF: require("../../assets/chf.png"),
  EUR: require("../../assets/eur.png"),
  USD: require("../../assets/usd.png"),
  ETH: require("../../assets/eth.png"),
  BTC: require("../../assets/btc.png"),
  rocket: require("../../assets/rocket.png"),
  cherries: require("../../assets/cherries.png"),
  money: require("../../assets/money.png"),
  star: require("../../assets/star.png"),
};

export const useGradientsColors = (
  mode: SkiaReadonlyValue<number>,
  baseColors = ["#547AFF", "rgb(74.5, 91.5, 255)", "#7D1EDF"]
) =>
  useDerivedValue(
    () => [
      mixColors(mode.current, Skia.Color(baseColors[0]), Skia.Color("#0B86EC")),
      mixColors(mode.current, Skia.Color(baseColors[1]), Skia.Color("#7D1EDF")),
      mixColors(mode.current, Skia.Color(baseColors[2]), Skia.Color("#DB4959")),
    ],
    [mode]
  );

export interface ModeProps {
  mode: SkiaReadonlyValue<number>;
}
