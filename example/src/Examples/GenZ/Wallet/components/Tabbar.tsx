import { rect } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { Home } from "./icons/Home";
import { Row } from "./Row";
import { PieChart } from "./icons/PieChart";
import { Activity } from "./icons/Activity";
import { CreditCard } from "./icons/CreditCard";

const { width } = Dimensions.get("window");

export const Tabbar = () => {
  return (
    <Row container={rect(0, 0, width, 64)} item={rect(0, 0, 24, 24)}>
      <Home />
      <PieChart />
      <Activity />
      <CreditCard />
    </Row>
  );
};
