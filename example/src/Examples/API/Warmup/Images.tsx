import React from "react";
import { Dimensions, View } from "react-native";

import { Image } from "./Image";

const { width } = Dimensions.get("window");

export const Images = () => {
  return (
    <View style={{ flex: 1, margin: 16 }}>
      <Image name="zurich" size={width / 2} />
      <Image name="zurich2" size={width / 2} />
      <Image name="zurich3" size={width / 2} />
    </View>
  );
};
