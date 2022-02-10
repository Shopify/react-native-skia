import React from "react";
import { View, StyleSheet } from "react-native";

import { AnimateTextOnPath } from "./AnimateTextOnPath";
import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithEasing } from "./InterpolationWithEasing";

export const AnimationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <AnimationWithTouchHandler />
      <InterpolationWithEasing />
      <AnimateTextOnPath />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
