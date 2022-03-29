import { Text } from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

//interface TopbarProps {}

export const Topbar = () => {
  const font = useFont("DMSansMedium", 24);
  return <Text text="Wallet" font={font} x={0} y={0} />;
};
