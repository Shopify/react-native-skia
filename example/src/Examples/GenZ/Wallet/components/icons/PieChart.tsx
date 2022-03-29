import React from "react";
import { Group, Path } from "@shopify/react-native-skia";

export const PieChart = () => {
  return (
    <Group style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round">
      <Path path="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <Path path="M22 12A10 10 0 0 0 12 2v10z" />
    </Group>
  );
};
