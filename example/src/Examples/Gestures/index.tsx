import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PinchGesture } from "./PinchGesture";

export const GestureExample: React.FC = () => {
  return (
    <GestureHandlerRootView>
      <ScrollView contentContainerStyle={styles.scrollview}>
        <PinchGesture />
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
});
