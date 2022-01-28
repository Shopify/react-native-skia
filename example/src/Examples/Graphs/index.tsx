import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { Interpolation } from "./Interpolation";
import { MountAnimation } from "./Mount";
import { Slider } from "./Slider";

const Padding = 10;

export const GraphsScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <Interpolation height={height * 0.25} width={width - Padding * 2} />
      <Slider height={height * 0.25} width={width - Padding * 2} />
      <MountAnimation height={height * 0.25} width={width - Padding * 2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Padding,
  },
});
