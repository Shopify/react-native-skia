import React from "react";
import { View, StyleSheet } from "react-native";

import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithSpring } from "./InterplationWithSpring";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleValueOverTime } from "./SimpleValueOverTime";
import { StaggeredTimelineAnimation } from "./StaggeredTimelineAnimation";

export const AnimationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <AnimationWithTouchHandler />
      <InterpolationWithEasing />
      <InterpolationWithSpring />
      <StaggeredTimelineAnimation />
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
