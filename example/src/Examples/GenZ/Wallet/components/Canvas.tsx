import { vec } from "@shopify/react-native-skia";

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
