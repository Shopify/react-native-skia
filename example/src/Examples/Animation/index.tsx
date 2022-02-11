import React from "react";
import { View, StyleSheet } from "react-native";

import { AnimateTextOnPath } from "./AnimateTextOnPath";
import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleAnimation } from "./SimpleAnimation";

export const AnimationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <SimpleAnimation />
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
