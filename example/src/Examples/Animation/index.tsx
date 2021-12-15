import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithSpring } from "./InterplationWithSpring";
import { InterpolatingValueOverTime } from "./InterpolationOverTime";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleTimelineAnimation } from "./SimpleTimelineAnimation";
import { SimpleValueOverTime } from "./SimpleValueOverTime";
import { StaggeredTimelineAnimation } from "./StaggeredTimelineAnimation";

export const AnimationExample: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollview}>
      <SimpleValueOverTime />
      <InterpolatingValueOverTime />
      <InterpolationWithEasing />
      <InterpolationWithSpring />
      <AnimationWithTouchHandler />
      <SimpleTimelineAnimation />
      <StaggeredTimelineAnimation />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
