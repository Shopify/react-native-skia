import React from "react";
import { StyleSheet, View } from "react-native";
import { SkiaCanvas } from "@shopify/react-native-skia";

export const Breathe = () => {
  return <SkiaCanvas style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
