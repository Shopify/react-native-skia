import { Fill, Group, Paint, rect } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { BilinearGradient } from "../../Aurora/components/BilinearGradient";

const { width, height } = Dimensions.get("window");

export const Background = () => {
  return (
    <Group>
      <Paint>
        <BilinearGradient
          colors={["#FAC6C0", "#EBBFF6", "#F5DFE6", "#F2DCF6"]}
          rect={rect(0, 0, width, height)}
        />
      </Paint>
      <Fill />
    </Group>
  );
};
