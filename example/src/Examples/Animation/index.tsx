import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";

import { AnimateTextOnPath } from "./AnimateTextOnPath";
import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleAnimation } from "./SimpleAnimation";
import { SpringBackTouchAnimation } from "./SpringBackTouch";

export const AnimationExample: React.FC = () => {
  useEffect(() => {
    setInterval(() => {
      let sum = 0;
      for (let i = 0; i < 1e7; i++) {
        sum += i;
      }
    }, 30);
  }, []);
  return (
    <View style={styles.container}>
      <SimpleAnimation />
      <InterpolationWithEasing />
      <AnimationWithTouchHandler />
      <AnimateTextOnPath />
      <SpringBackTouchAnimation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
