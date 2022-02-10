import React from "react";
import { View, StyleSheet } from "react-native";

import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleValueOverTime } from "./SimpleValueOverTime";

export const AnimationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <AnimationWithTouchHandler />
      <InterpolationWithEasing />
      <SimpleValueOverTime />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
