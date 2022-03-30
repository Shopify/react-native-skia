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
};

export const useGradientsColors = (mode: SkiaReadonlyValue<number>) =>
  useDerivedValue(
    () => [
      mixColors(mode.current, Skia.Color("#547AFF"), Skia.Color("#0B86EC")),
      mixColors(
        mode.current,
        Skia.Color("rgb(74.5, 91.5, 255)"),
        Skia.Color("#7D1EDF")
      ),
      mixColors(mode.current, Skia.Color("#413DFF"), Skia.Color("#DB4959")),
    ],
    [mode]
  );

export interface ModeProps {
  mode: SkiaReadonlyValue<number>;
}
