import React from "react";
import { View } from "react-native";

import { Icon } from "./Icon";

export const Warmup = () => {
  return (
    <View
      style={{ flex: 1, margin: 16, flexDirection: "row", flexWrap: "wrap" }}
    >
      <Icon name="close" size={128} />
      <Icon name="activity" size={128} color="red" />
      <Icon name="battery" size={128} color="purple" />
      <Icon name="bluetooth" size={128} color="lightblue" />
      <Icon name="book" size={64} />
      <Icon name="cpu" size={64} />
      <Icon name="close" size={128} />
      <Icon name="activity" size={128} color="red" />
      <Icon name="battery" size={128} color="purple" />
      <Icon name="bluetooth" size={128} color="lightblue" />
      <Icon name="book" size={64} />
      <Icon name="cpu" size={64} />
    </View>
  );
};
