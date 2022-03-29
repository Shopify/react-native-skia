import { Text } from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

//interface TopbarProps {}

export const Topbar = () => {
  const text = "Wallet";
  const font = useFont("DMSansMedium", 24);
  const { height } = font.measureText(text);
  const x = 16;
  const y = 44 + 3 + height;
  return <Text text={text} font={font} x={x} y={y} color="#1E1E20" />;
};
