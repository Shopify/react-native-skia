import React from "react";
import { StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

import { AnimateTextOnPath } from "./AnimateTextOnPath";
import { AnimationWithTouchHandler } from "./AnimationWithTouchHandler";
import { BokehExample } from "./BokehExample";
import { InterpolationWithEasing } from "./InterpolationWithEasing";
import { SimpleAnimation } from "./SimpleAnimation";
import { SpringBackTouchAnimation } from "./SpringBackTouch";

export const ReanimatedExample: React.FC = () => {
  return (
    <GestureHandlerRootView>
      <ScrollView style={styles.container}>
        <SimpleAnimation />
        <InterpolationWithEasing />
        <AnimationWithTouchHandler />
        <AnimateTextOnPath />
        <SpringBackTouchAnimation />
        <BokehExample />
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
