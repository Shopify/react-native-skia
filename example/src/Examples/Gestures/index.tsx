import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { PanGesture } from "./PanGesture";

export const GestureExample: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollview}>
      {/* <SimpleValueOverTime /> */}
      <PanGesture />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
